export const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled", "rejected"];
const TRANSITIONS = Object.freeze({pending:["confirmed","rejected","cancelled"],confirmed:["completed","cancelled"],completed:[],cancelled:[],rejected:[]});
export function isBookingStatus(value){return typeof value==="string"&&BOOKING_STATUSES.includes(value);}
export function canTransitionBooking(from,to){return isBookingStatus(from)&&isBookingStatus(to)&&from!==to&&TRANSITIONS[from].includes(to);}
export function allowedBookingTransitions(status){return isBookingStatus(status)?TRANSITIONS[status]:[];}
