import { authenticatedApiRequest } from "../../../api/client";
import type { AdminBooking, AdminDashboardStats, AdminListingReview, AdminOperationResult, BookingStatus } from "../types";
import { normalizeAdminBooking, normalizeAdminBookings, normalizeAdminDashboardStats, normalizeAdminListingReviews, type RawAdminRecord } from "./adminNormalization";

type Requester = (path: string, token: string, options?: RequestInit) => Promise<Response>;
export type AdminRequestOptions = RequestInit & { requester?: Requester };

function requestOptions(options: AdminRequestOptions = {}): { requester: Requester; init: RequestInit } {
  const { requester = authenticatedApiRequest, ...init } = options;
  return { requester, init };
}

function errorCode(status: number): "UNAUTHORIZED"|"FORBIDDEN"|"VALIDATION_FAILED"|"NOT_FOUND"|"CONFLICT"|"OPERATION_FAILED" {
  if(status===401)return "UNAUTHORIZED";if(status===403)return "FORBIDDEN";if(status===400)return "VALIDATION_FAILED";if(status===404)return "NOT_FOUND";if(status===409)return "CONFLICT";return "OPERATION_FAILED";
}

async function safePayload(response: Response): Promise<RawAdminRecord> { try { const value=await response.json(); return value&&typeof value==="object"?value as RawAdminRecord:{}; } catch { return {}; } }
function message(payload: RawAdminRecord, fallback: string): string { return typeof payload.message==="string"&&payload.message.trim()?payload.message.trim():fallback; }
function failure<T>(code: "UNAUTHORIZED"|"FORBIDDEN"|"VALIDATION_FAILED"|"NOT_FOUND"|"CONFLICT"|"CONTRACT_INVALID"|"OPERATION_FAILED", text: string): AdminOperationResult<T> { return {success:false,code,message:text}; }

async function execute<T>(path:string, token:string, options:AdminRequestOptions, normalize:(payload:RawAdminRecord)=>T|null, fallback:string):Promise<AdminOperationResult<T>>{
  if(!token)return failure("UNAUTHORIZED","Authentication is required.");
  const {requester,init}=requestOptions(options);
  try { const response=await requester(path,token,init); const payload=await safePayload(response); if(!response.ok)return failure(errorCode(response.status),message(payload,fallback)); const data=normalize(payload); return data===null?failure("CONTRACT_INVALID","The server returned an invalid admin response."):{success:true,data,message:typeof payload.message==="string"?payload.message:undefined}; }
  catch(error){ if(error instanceof DOMException&&error.name==="AbortError")throw error; return failure("OPERATION_FAILED",fallback); }
}

export function loadAdminStats(accessToken:string,options:AdminRequestOptions={}):Promise<AdminOperationResult<AdminDashboardStats>>{return execute("/api/admin/stats",accessToken,options,(p)=>normalizeAdminDashboardStats(p),"Admin statistics could not be loaded.");}
export function loadAdminBookings(accessToken:string,options:AdminRequestOptions={}):Promise<AdminOperationResult<AdminBooking[]>>{return execute("/api/admin/bookings",accessToken,options,(p)=>normalizeAdminBookings(p),"Bookings could not be loaded.");}
export function updateAdminBookingStatus(id:string|number,status:BookingStatus,accessToken:string,options:AdminRequestOptions={}):Promise<AdminOperationResult<AdminBooking>>{return execute(`/api/admin/bookings/${encodeURIComponent(String(id))}/status`,accessToken,{...options,method:"PATCH",headers:{"Content-Type":"application/json",...(options.headers||{})},body:JSON.stringify({status,expectedUpdatedAt:(options as AdminRequestOptions&{expectedUpdatedAt?:string}).expectedUpdatedAt})},(p)=>normalizeAdminBooking((p.data??p.booking??{}) as RawAdminRecord),"Booking status could not be updated.");}
export function loadPendingListings(accessToken:string,options:AdminRequestOptions={}):Promise<AdminOperationResult<AdminListingReview[]>>{return execute("/api/admin/listings/pending",accessToken,options,(p)=>normalizeAdminListingReviews(p),"Pending listings could not be loaded.");}
export function approvePendingListing(id:string|number,accessToken:string,options:AdminRequestOptions={}):Promise<AdminOperationResult<AdminListingReview>>{return execute(`/api/admin/listings/${encodeURIComponent(String(id))}/approve`,accessToken,{...options,method:"PATCH"},(p)=>normalizeAdminListingReviews({data:[p.data]} )[0]??null,"Listing could not be approved.");}
export function rejectPendingListing(id:string|number,reason:string,accessToken:string,options:AdminRequestOptions={}):Promise<AdminOperationResult<AdminListingReview>>{return execute(`/api/admin/listings/${encodeURIComponent(String(id))}/reject`,accessToken,{...options,method:"PATCH",headers:{"Content-Type":"application/json",...(options.headers||{})},body:JSON.stringify({reason:reason.trim()})},(p)=>normalizeAdminListingReviews({data:[p.data]} )[0]??null,"Listing could not be rejected.");}
