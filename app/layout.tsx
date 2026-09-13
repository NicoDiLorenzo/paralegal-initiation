import type {Metadata,Viewport} from "next";import "./globals.css";
export const metadata:Metadata={title:"Paralegal Initiation · Victoria Ressia",description:"Programa educativo bilingüe para la práctica paralegal en Florida.",applicationName:"Paralegal Initiation",manifest:"/manifest.webmanifest",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export const viewport:Viewport={themeColor:"#341525",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es" suppressHydrationWarning><body>{children}</body></html>}
