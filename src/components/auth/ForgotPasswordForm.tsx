import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { useAuth } from '@/services/useAuth';

interface ForgotPasswordFormProps {
    onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const { resetPassword } = useAuth();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setMessage("")

        if (!email) {
            setError("Please enter your email address.")
            setLoading(false)
            return
        }

        try {
            await resetPassword(email);
            setMessage("Check your email for the password reset link.")
            setEmail("")
        } catch (err: any) {
            setError(err.message ?? "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>
                    Enter your email to receive a password reset link
                </CardDescription>
            </CardHeader>
            <CardContent>
                {message && (
                    <Alert className="mb-4 border-green-500/30 bg-green-500/10 text-green-600">
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Sending..." : "Send link"}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onBack}
                        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to sign in
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
