export default function ExportLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <style>{`
                @media print {
                    @page { size: A4; margin: 12mm 10mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-trigger { display: none !important; }
                    .page-break { break-before: page; }
                    .no-break { break-inside: avoid; }
                    /* Hide Next.js UI chrome */
                    nav, header, aside, [data-sidebar], [data-radix-popper-content-wrapper] { display: none !important; }
                }
            `}</style>
            {children}
        </>
    );
}
