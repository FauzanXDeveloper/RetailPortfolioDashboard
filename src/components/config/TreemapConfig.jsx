/**
 * TreemapConfig — wraps DimensionMeasureConfig for Treemap widgets.
 */
import React from "react";
import DimensionMeasureConfig from "./DimensionMeasureConfig";

export default function TreemapConfig({ widget }) {
  return <DimensionMeasureConfig widget={widget} />;
}
