import { useMemo } from "react";

export interface CostCalculation {
  gross: number;
  employerTax: number;
  totalCostBase: number;
  fee: number;
  finalTotal: number;
  effectiveRate?: number;
}

export interface CostCalculatorParams {
  gross: number;
  employerRate: number;
  feeRate: number;
  feeModel: "GROSS" | "TOTAL_COST";
  fxSpot?: number;
  fxSpread?: number;
}

export const useCostCalculator = (params: CostCalculatorParams): CostCalculation => {
  return useMemo(() => {
    const { gross, employerRate, feeRate, feeModel, fxSpot, fxSpread = 0 } = params;

    const employerTax = gross * employerRate;
    const totalCostBase = gross + employerTax;
    const fee = feeModel === "GROSS" ? gross * feeRate : totalCostBase * feeRate;
    const finalTotal = totalCostBase + fee;

    const effectiveRate = fxSpot ? fxSpot * (1 + fxSpread) : undefined;

    return {
      gross,
      employerTax,
      totalCostBase,
      fee,
      finalTotal,
      effectiveRate,
    };
  }, [params.gross, params.employerRate, params.feeRate, params.feeModel, params.fxSpot, params.fxSpread]);
};
