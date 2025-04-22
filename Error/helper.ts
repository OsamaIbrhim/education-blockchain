// Contract
export const handleContractError = (errorCase: string, error: any): never => {
    throw new Error(`Contract utilities: ${errorCase} error: ${error.message}`);
};