import {Leaf} from "lucide-react"; import Link from "next/link";
export function Logo(){return <Link className="logo" href="/notes"><span className="logo-mark"><Leaf size={19}/></span><span>Manabi Note</span></Link>}
