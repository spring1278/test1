declare module '@lhncbc/ucum-lhc' {
  export interface ConvertResult {
    status: 'succeeded' | 'failed' | 'error';
    toVal: number | null;
    msg: string[];
    code?: string;
    fromUnit?: { property_?: string; name_?: string };
    toUnit?: { property_?: string; name_?: string };
  }
  export interface UcumLhcUtilsInstance {
    convertUnitTo(
      fromUnitCode: string,
      fromVal: number,
      toUnitCode: string,
      options?: { molecularWeight?: number | null; charge?: number | null; suggest?: boolean },
    ): ConvertResult;
    validateUnitString(uStr: string, suggest?: boolean): { status: string; unit?: { name?: string } | null; msg?: string[] };
  }
  const ucum: { UcumLhcUtils: { getInstance(): UcumLhcUtilsInstance } };
  export default ucum;
}
