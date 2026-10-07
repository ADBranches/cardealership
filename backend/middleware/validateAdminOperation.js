import { isBookingStatus } from "../utils/adminStatusTransitions.js";
const fail=(res,status,code,message)=>res.status(status).json({success:false,code,message});
export function validatePositiveId(req,res,next){const id=Number(req.params.id);if(!Number.isInteger(id)||id<=0)return fail(res,400,"VALIDATION_FAILED","A positive numeric resource ID is required.");req.adminResourceId=id;return next();}
export function validateBookingStatusBody(req,res,next){const status=typeof req.body?.status==="string"?req.body.status.trim().toLowerCase():"";if(!isBookingStatus(status))return fail(res,400,"VALIDATION_FAILED","Unsupported booking status.");req.adminBookingStatus=status;return next();}
export function validateListingRejectionBody(req,res,next){const reason=typeof req.body?.reason==="string"?req.body.reason.trim():"";if(reason.length<5||reason.length>500)return fail(res,400,"VALIDATION_FAILED","Rejection reason must be 5 to 500 characters.");req.adminRejectionReason=reason;return next();}
