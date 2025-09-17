function vehicleRegistrationMailBodyInterface(
    userName: string,
    phoneNo: string,
    email: string | undefined,
    vehicleCompanyAndModel: string,
    rcNumber: string,
    timeStamp: string
): string {
    return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: auto;">
    <p style="margin-bottom: 20px;">Dear <strong>Admin</strong>,</p>
    <p style="margin-bottom: 25px;">
        A new vehicle has been <strong style="color: #007BFF;">registered</strong> by a user and is
        <strong style="color: #DC3545;">pending your approval</strong>.
    </p>
    <h3 style="color: #444; margin-bottom: 15px;">📄 Registration Details:</h3>
    <table style="border-collapse: collapse; width: 100%; font-size: 15px; border-color: #ddd;">
        <tr style="background-color: #f9f9f9;">
            <th style="padding: 12px;">Field</th>
            <th style="padding: 12px;">Value</th>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>User Name</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${userName}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>User Email</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${email ?? 'N/A'}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>User Phone</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${phoneNo}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Vehicle Make & Model</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${vehicleCompanyAndModel}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>License Plate</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${rcNumber}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Registration Date</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${timeStamp}</td>
        </tr>
    </table>
    <p style="margin-top: 30px; font-size: 16px;">
        Please <strong style="color: #28A745;">log in to the admin dashboard</strong> to review and approve this registration.
    </p>
    <p style="margin-top: 40px; font-size: 16px;">
        Thank you,<br />
        <em>Clean Charge</em>
    </p>
</div>`;
}

function emailVerificationMailBodyInterface(
    name: string,
    verificationLink: string
): string {
    return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 6px;">
    <p style="margin-bottom: 20px;">Dear <strong>${name}</strong>,</p>
    <p style="margin-bottom: 25px;">
        Thank you for signing up! To complete your registration, please verify your email address by clicking the button below.
    </p>
    <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" target="_blank" style="display: inline-block; background-color: #007BFF; color: #fff; text-decoration: none; padding: 14px 28px; font-size: 16px; border-radius: 6px; font-weight: bold;">
            Verify Email
        </a>
    </div>
    <p style="margin-bottom: 20px; font-size: 15px; color: #555;">
        If the button above does not work, copy and paste the following link into your browser:
    </p>
    <p style="word-break: break-all; font-size: 14px; color: #007BFF;">
        <a href="${verificationLink}" target="_blank" style="color: #007BFF; text-decoration: none;">${verificationLink}</a>
    </p>
    <p style="margin-top: 30px; font-size: 15px; color: #555;">
        This link will expire in <strong>24 hours</strong> for security reasons.
    </p>
    <p style="margin-top: 40px; font-size: 16px;">
        Cheers,<br />
        <em>Clean Charge Team</em>
    </p>
</div>`;
}

function chargeCompletionMailBodyInterface(
    userName: string,
    location: string,
    sessionId: string,
    startTime: string,
    endTime: string,
    energyUsed: string,
    baseAmount: string,
    netCGST: string,
    netSGST: string,
    netIGST: string,
    totalAmount: string
): string {
    return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 6px;">
    <p style="margin-bottom: 20px;">Dear <strong>${userName}</strong>,</p>
    <p style="margin-bottom: 25px;">
        Thank you for charging with <strong style="color: #007BFF;">Clean Charge</strong>. Below are the details of the completed charging session and the corresponding bill summary.
    </p>

    <h3 style="color: #444; margin-bottom: 12px;">⚡ Session Summary</h3>
    <table style="border-collapse: collapse; width: 100%; font-size: 15px; border-color: #ddd;">
        <tr style="background-color: #f9f9f9;">
            <th style="padding: 12px; text-align: left;">Field</th>
            <th style="padding: 12px; text-align: left;">Value</th>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Location</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${location}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Session ID</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${sessionId}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Start Time</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${startTime}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>End Time</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${endTime}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;"><strong>Energy Used (kWh)</strong></td>
            <td style="padding: 12px; border-top: 1px solid #ddd;">${energyUsed}</td>
        </tr>
    </table>

    <h3 style="color: #444; margin: 24px 0 12px;">🧾 Billing Summary</h3>
    <table style="border-collapse: collapse; width: 100%; font-size: 15px; border-color: #ddd;">
        <tr style="background-color: #f9f9f9;">
            <th style="padding: 12px; text-align: left;">Charge Component</th>
            <th style="padding: 12px; text-align: right;">Amount</th>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;">Base Amount</td>
            <td style="padding: 12px; border-top: 1px solid #ddd; text-align: right;">${baseAmount}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;">CGST</td>
            <td style="padding: 12px; border-top: 1px solid #ddd; text-align: right;">${netCGST}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;">SGST</td>
            <td style="padding: 12px; border-top: 1px solid #ddd; text-align: right;">${netSGST}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 1px solid #ddd;">IGST</td>
            <td style="padding: 12px; border-top: 1px solid #ddd; text-align: right;">${netIGST}</td>
        </tr>
        <tr>
            <td style="padding: 12px; border-top: 2px solid #ccc; font-weight: bold;">Total Amount</td>
            <td style="padding: 12px; border-top: 2px solid #ccc; text-align: right; font-weight: bold; color: #000;">${totalAmount}</td>
        </tr>
    </table>

    <p style="margin-top: 24px; font-size: 15px; color: #555;">
        This is a system-generated receipt for your records. For tax applicability, CGST and SGST apply to intra-state supplies, while IGST applies to inter-state supplies as per GST rules.
    </p>

    <p style="margin-top: 30px; font-size: 16px;">
        Regards,<br />
        <em>Clean Charge Team</em>
    </p>
</div>`;
}

export {
    vehicleRegistrationMailBodyInterface,
    emailVerificationMailBodyInterface,
    chargeCompletionMailBodyInterface,
}