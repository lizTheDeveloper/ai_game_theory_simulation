export type FilterFn = (rootValue?: any, args?: any, context?: any, info?: any) => boolean;
export declare const withFilter: (asyncIteratorFn: () => AsyncIterableIterator<any>, filterFn: FilterFn) => (rootValue: any, args: any, context: any, info: any) => AsyncIterator<any>;
