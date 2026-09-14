import { RefreshCw } from "lucide-react";
import { Button } from "../../../app/components/ui/button";
import { Skeleton } from "../../../app/components/ui/skeleton";
import { useDispatchBoard } from "../hooks/useDispatchBoard";
import { BOOKING_STATUS_COLUMNS } from "../validation/bookingTransitions";
import { DispatchColumn } from "./DispatchColumn";
import { DispatchErrorState } from "./DispatchErrorState";
import "./DispatchBoard.css";
export function DispatchBoard(){const {state,refresh,moveBooking}=useDispatchBoard(); if(state.connectionStatus==="idle"||state.connectionStatus==="refreshing")return <section aria-busy="true" aria-label="Loading dispatch board" className="dispatch-loading">{BOOKING_STATUS_COLUMNS.map(s=><Skeleton key={s} className="h-64 w-full"/>)}</section>; if(state.error&&!state.bookings.length)return <DispatchErrorState message={state.error.message} onRetry={()=>void refresh()}/>; return <section className="dispatch-board" aria-labelledby="dispatch-board-title"><header className="dispatch-board-header"><div><p>Test-drive operations</p><h2 id="dispatch-board-title">Dispatch management</h2><span>{state.bookings.length} bookings across four verified statuses</span></div><Button variant="outline" onClick={()=>void refresh()} disabled={state.connectionStatus==="refreshing"}><RefreshCw aria-hidden="true"/>Refresh</Button></header>{state.error&&<div role="alert" className="dispatch-inline-error">{state.error.message}</div>}<div className="dispatch-grid">{BOOKING_STATUS_COLUMNS.map(status=><DispatchColumn key={status} status={status} bookings={state.bookings.filter(b=>b.status===status)} pendingByBooking={state.pendingByBooking} onMove={(id,target)=>void moveBooking(id,target)}/>)}</div></section>}
