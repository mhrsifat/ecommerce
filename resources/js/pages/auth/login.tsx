import { Form, Head, router } from '@inertiajs/react';
import { ShieldCheck, Store } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

type Props = {
    status?: string;
};

export default function Login({ status }: Props) {
    const [loadingRole, setLoadingRole] = useState<'admin' | 'owner' | null>(null);

    const handleQuickLogin = (email: string, role: 'admin' | 'owner') => {
        setLoadingRole(role);

        router.post(
            '/login',
            {
                email,
                password: 'password',
                remember: true,
            },
            {
                onError: () => {
                    // Fallback to alternative admin if admin1 not found
                    if (role === 'admin') {
                        router.post(
                            '/login',
                            {
                                email: 'admin@csnbangladesh.com',
                                password: 'password',
                                remember: true,
                            },
                            {
                                onFinish: () => setLoadingRole(null),
                            },
                        );
                    } else {
                        setLoadingRole(null);
                    }
                },
                onFinish: () => setLoadingRole(null),
            },
        );
    };

    return (
        <>
            <Head title="Sign In" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder="name@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                placeholder="Password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            disabled={processing || loadingRole !== null}
                        >
                            {processing && <Spinner />}
                            Log in
                        </Button>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-emerald-600">
                    {status}
                </div>
            )}

            <div className="mt-6 rounded-xl border border-dashed bg-muted/30 p-4">
                <div className="mb-3 text-center sm:text-left">
                    <p className="text-sm font-semibold">Demo Quick Login</p>
                    <p className="text-xs text-muted-foreground">
                        Instant one-click access for evaluators.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2 text-xs"
                        disabled={loadingRole !== null}
                        onClick={() => handleQuickLogin('admin@admin.com', 'admin')}
                    >
                        {loadingRole === 'admin' ? (
                            <Spinner />
                        ) : (
                            <ShieldCheck className="h-4 w-4 text-primary" />
                        )}
                        Login as Admin
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2 text-xs"
                        disabled={loadingRole !== null}
                        onClick={() => handleQuickLogin('rahim@shop.com', 'owner')}
                    >
                        {loadingRole === 'owner' ? (
                            <Spinner />
                        ) : (
                            <Store className="h-4 w-4 text-emerald-600" />
                        )}
                        Login as Shop Owner
                    </Button>
                </div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Or sign in with any registered shop owner credentials.
                </p>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Sign In',
    description: 'Log in as an Administrator or Shop Owner',
};
