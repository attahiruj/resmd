export interface ImportMapperState {
  sections: string[];
  bioFields: Map<string, string>;
  lines: string[];
}

export interface MappingResult {
  rawContent: string;
  detectedFields: {
    name?: string;
    email?: string;
    phone?: string;
    url?: string;
  };
}
