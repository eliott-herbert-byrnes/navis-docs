'use client';

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

type OtpInputProps = {
    code: string;
    setCode: (code: string) => void;
}

export const OtpInput = ({code, setCode}: OtpInputProps) => {

    return (
        <InputOTP
        value={code}
        onChange={(e) => setCode(e)}
        maxLength={5}
        pattern={REGEXP_ONLY_DIGITS}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
        </InputOTPGroup>
      </InputOTP>
    )
}

