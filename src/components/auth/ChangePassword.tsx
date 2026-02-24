import { useEffect, useState } from "react"
import { supabase } from "../../integrations/supabase/client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useAuth } from '@/services/useAuth';
import { useNavigate } from 'react-router-dom';
import { Header } from "../layout/Header"



export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [isRecovery, setIsRecovery] = useState(false)

    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    useEffect(() => {
        // Redirect if not authenticated and not in recovery
        if (!authLoading && !isAuthenticated && !isRecovery) {
            navigate('/auth');
        }
    }, [authLoading, isAuthenticated, isRecovery, navigate]);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setIsRecovery(true)
                setMessage("Please enter your new password.")
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setMessage("")

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.")
            setLoading(false)
            return
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.")
            setLoading(false)
            return
        }

        try {
            if (!isRecovery) {
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                if (!user?.email) {
                    setError("You must be logged in.")
                    return
                }

                const { error: verifyError } =
                    await supabase.auth.signInWithPassword({
                        email: user.email,
                        password: oldPassword,
                    })

                if (verifyError) {
                    setError("Current password is incorrect.")
                    return
                }
            }

            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) {
                setError(error.message)
            } else {
                setMessage("Password updated successfully!")
                setOldPassword("")
                setNewPassword("")
                setConfirmPassword("")

                if (isRecovery) {
                    await supabase.auth.signOut()
                }
            }
        } catch (err: any) {
            setError(err.message ?? "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    const PasswordInput = ({
        id,
        label,
        value,
        onChange,
        show,
        toggle,
        placeholder,
    }: {
        id: string
        label: string
        value: string
        onChange: (v: string) => void
        show: boolean
        toggle: () => void
        placeholder: string
    }) => (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    className="pr-10"
                    required
                />
                <button
                    type="button"
                    onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    )

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!user && !isRecovery) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col w-full bg-background">
            <Header email={user?.email} onSignOut={handleSignOut} />
            <Card className="mx-auto w-full mt-10 max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-xl">
                        {isRecovery ? "Reset Password" : "Change Password"}
                    </CardTitle>
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

                    <form onSubmit={handleChangePassword} className="space-y-5">
                        {!isRecovery && (
                            <PasswordInput
                                id="current-password"
                                label="Current password"
                                value={oldPassword}
                                onChange={setOldPassword}
                                show={showOld}
                                toggle={() => setShowOld(!showOld)}
                                placeholder="Enter current password"
                            />
                        )}

                        <PasswordInput
                            id="new-password"
                            label="New password"
                            value={newPassword}
                            onChange={setNewPassword}
                            show={showNew}
                            toggle={() => setShowNew(!showNew)}
                            placeholder="At least 8 characters"
                        />

                        <PasswordInput
                            id="confirm-password"
                            label="Confirm new password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            show={showConfirm}
                            toggle={() => setShowConfirm(!showConfirm)}
                            placeholder="Re-enter new password"
                        />

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Updating..." : "Update password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
        // </div>
    )
}