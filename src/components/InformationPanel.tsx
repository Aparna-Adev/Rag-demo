import { motion } from 'framer-motion'
import ConfidenceCard from './ConfidenceCard'
import FeedbackCard from './FeedbackCard'
import MetadataCard from './MetadataCard'
import RetrievedDocumentsCard from './RetrievedDocumentsCard'

export default function InformationPanel({onDocuments,onToast}:{onDocuments:()=>void;onToast:(s:string)=>void}){return <aside aria-label="Answer information" className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-slate-200 bg-[#fbfcfe] p-4 xl:block 2xl:w-[340px]"><motion.div initial="hidden" animate="show" variants={{hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:.08}}}} className="space-y-3">{[<RetrievedDocumentsCard key="d" onViewAll={onDocuments}/>,<ConfidenceCard key="c"/>,<MetadataCard key="m"/>,<FeedbackCard key="f" onToast={onToast}/>].map((item,i)=><motion.div key={i} variants={{hidden:{opacity:0,y:10},show:{opacity:1,y:0}}} transition={{duration:.3}}>{item}</motion.div>)}</motion.div></aside>}
