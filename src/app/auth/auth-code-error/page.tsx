import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AuthCodeErrorPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-[#0a0a0a] p-4">
            <Card className="w-full max-w-md border-white/10 bg-[#0f0f11]">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-red-500/10 p-3">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <CardTitle className="text-xl text-white">Authentication Failed</CardTitle>
                    <CardDescription className="text-zinc-400">
                        We couldn't verify your login link. This usually happens for security reasons.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="rounded-lg bg-white/5 p-4 text-sm text-zinc-300 text-left space-y-2 border border-white/5">
                        <p className="font-medium text-white">Common causes:</p>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-400">
                            <li>Link expired (links are valid for a short time).</li>
                            <li>Opened on a different device or browser (Cross-Device Login).</li>
                            <li>Link was already used.</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter>
                    <Link href="/login" className="w-full">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                            Back to Login
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
