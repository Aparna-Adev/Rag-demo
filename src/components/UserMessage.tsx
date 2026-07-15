import { motion } from 'framer-motion'

export default function UserMessage({ children }: { children: string }) {
  return <motion.div initial={{ opacity:0, y:8, scale:.98 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:.3 }} className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-3.5 text-sm leading-6 text-white shadow-lg shadow-blue-100">{children}</motion.div>
}
