/**
 * Cloud Environment Sharing — Uses GitHub Gist API for cross-device env sharing.
 * Environments are encrypted with AES before uploading.
 * Each shared env gets a short 8-char code for easy sharing.
 */

// ─── Encryption Helpers (Web Crypto API) ───

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

/**
 * Derive AES-GCM key from password using PBKDF2.
 */
async function deriveKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    ENCODER.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt data string with password.
 * Returns base64 string of: salt(16) + iv(12) + ciphertext
 */
async function encrypt(plaintext, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    ENCODER.encode(plaintext)
  );
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt base64 data with password.
 * Returns plaintext string.
 */
async function decrypt(base64Data, password) {
  const combined = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return DECODER.decode(decrypted);
}

// ─── GitHub Gist API ───

const GIST_API = "https://api.github.com/gists";
const GIST_DESCRIPTION_PREFIX = "RetailPortfolioDashboard-Env-";

/**
 * Generate a short 8-char share code.
 */
function generateShareCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0,O,1,I,l
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Upload an encrypted environment to GitHub Gist (anonymous).
 *
 * @param {object} envData - The environment data to share
 * @param {string} password - Password to encrypt (default: "021008140191")
 * @returns {{ shareCode: string, gistId: string, gistUrl: string }}
 */
export async function uploadToCloud(envData, password = "021008140191") {
  const shareCode = generateShareCode();
  const plaintext = JSON.stringify(envData);
  const encryptedData = await encrypt(plaintext, password);

  // Create anonymous Gist
  const payload = {
    description: GIST_DESCRIPTION_PREFIX + shareCode,
    public: false,
    files: {
      [`env_${shareCode}.enc`]: {
        content: JSON.stringify({
          _type: "analytics-cloud-share",
          shareCode,
          version: 1,
          encrypted: encryptedData,
          createdAt: new Date().toISOString(),
        }),
      },
    },
  };

  const res = await fetch(GIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload to cloud: ${res.status} ${err}`);
  }

  const gist = await res.json();
  return {
    shareCode,
    gistId: gist.id,
    gistUrl: gist.html_url,
  };
}

/**
 * Search for a shared environment by share code (anonymous search).
 * Since anonymous Gists can't be searched by API, we store the gistId
 * in the share code mapping. Alternative: try fetching raw file directly.
 *
 * We use a two-step approach:
 * 1. The uploader stores gistId locally and gets a share code.
 * 2. We store the mapping (shareCode -> gistId) in a known "registry" Gist.
 *
 * For simplicity, we'll encode the gistId into the share code itself.
 * Share code format: first 8 chars are the code, the gistId is appended.
 * Full share string: "CODE-gistId"
 */
export async function downloadFromCloud(fullShareCode, password = "021008140191") {
  // Parse the share code: "ABCD1234-gistId" or just "gistId"
  let gistId;
  if (fullShareCode.includes("-")) {
    gistId = fullShareCode.split("-").slice(1).join("-");
  } else if (fullShareCode.length > 20) {
    // Likely a raw gist ID
    gistId = fullShareCode;
  } else {
    throw new Error("Invalid share code format. Please use the full code provided when sharing.");
  }

  // Fetch the Gist
  const res = await fetch(`${GIST_API}/${gistId}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Share code not found. It may have expired or been deleted.");
    }
    throw new Error(`Failed to fetch from cloud: ${res.status}`);
  }

  const gist = await res.json();

  // Find the encrypted file
  const files = Object.values(gist.files);
  const encFile = files.find((f) => f.filename.endsWith(".enc"));
  if (!encFile) throw new Error("Invalid cloud share: no encrypted data found.");

  const wrapper = JSON.parse(encFile.content);
  if (wrapper._type !== "analytics-cloud-share") {
    throw new Error("Invalid cloud share format.");
  }

  // Decrypt
  try {
    const plaintext = await decrypt(wrapper.encrypted, password);
    const envData = JSON.parse(plaintext);
    return envData;
  } catch (e) {
    throw new Error("Incorrect password. Please check and try again.");
  }
}

/**
 * Build the full share string from code + gistId.
 * This is what users copy/paste to share.
 */
export function buildShareString(shareCode, gistId) {
  return `${shareCode}-${gistId}`;
}
