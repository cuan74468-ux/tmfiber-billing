/* Public environment switch; endpoint URL is not an authentication secret. Do not put credentials here. */
export const TM_STAGE={environment:'STAGING',apiEndpoint:'',readOnly:true,mutationsEnabled:false,financeEnabled:false,routerCommandsEnabled:false};
export const hasStagingEndpoint=()=>/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(TM_STAGE.apiEndpoint);
