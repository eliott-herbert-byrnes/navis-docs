'use server';

import {z} from "zod";
import {limiter} from '../lib/rate-limit';
// import { verifyOtpAndConsume } from "@/lib/otp";
import { signIn } from "@/auth";

const schema = z.object({
    email: z.email(),
    code: z.string().length(5),
})

export const verifyOtpAction = async (input: {email: string, code: string}) => {
    const {success} = await limiter('otp:verify');
    if (!success) return {ok: false, message: 'Too many attempts. Try later'};

    const {email, code} = schema.parse({
        email: input.email.trim().toLowerCase(),
        code: input.code.trim(),
    })

    

    // const ok = await verifyOtpAndConsume(email, code);
    // if (!ok) return {ok: false, message: 'Invalid or expired code'};

    const res = await signIn("credentials", { email, code, redirect: false });
    if (res?.error) return { ok: false, message: res.error };
    return { ok: true };
;}