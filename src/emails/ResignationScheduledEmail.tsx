import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Section,
} from "@react-email/components";
import * as React from "react";
import { format } from "date-fns";

interface ResignationScheduledEmailProps {
    employeeName: string;
    interviewDate: string; // ISO String
    actionUrl: string;
}

export const ResignationScheduledEmail = ({
    employeeName,
    interviewDate,
    actionUrl,
}: ResignationScheduledEmailProps) => {
    const formattedDate = interviewDate
        ? format(new Date(interviewDate), 'MMMM d, yyyy @ h:mm a')
        : 'Scheduled Date';

    return (
        <Html>
            <Head />
            <Preview>Exit Interview Scheduled</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Exit Interview Scheduled</Heading>
                    <Text style={text}>Dear {employeeName},</Text>
                    <Text style={text}>
                        Your resignation has been processed and your Exit Interview has been scheduled.
                    </Text>
                    <Section style={infoBox}>
                        <Text style={infoLabel}>Scheduled Date & Time:</Text>
                        <Text style={infoValue}>{formattedDate}</Text>
                    </Section>
                    <Text style={text}>
                        Please complete the Exit Form prior to your interview. You can access it using the secure link below.
                    </Text>
                    <Section style={btnContainer}>
                        <Button style={button} href={actionUrl}>
                            Access Exit Form
                        </Button>
                    </Section>
                    <Text style={text}>
                        If you need to reschedule, please contact HR immediately.
                    </Text>
                    <Section style={footer}>
                        <Text style={footerText}>
                            This is an automated message from the Retention Intelligence Hub.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default ResignationScheduledEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
};

const h1 = {
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "1.1",
    margin: "0 0 24px",
};

const text = {
    fontSize: "16px",
    lineHeight: "1.4",
    color: "#484848",
    marginBottom: "24px",
};

const infoBox = {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "24px",
};

const infoLabel = {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "8px",
    fontWeight: "500" as const,
};

const infoValue = {
    fontSize: "18px",
    color: "#111827",
    fontWeight: "600" as const,
    margin: "0",
};

const btnContainer = {
    textAlign: "center" as const,
    marginBottom: "24px",
};

const button = {
    backgroundColor: "#4f46e5", // Indigo-600
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
};

const footer = {
    borderTop: "1px solid #eaeaea",
    marginTop: "24px",
    paddingTop: "24px",
};

const footerText = {
    fontSize: "14px",
    color: "#9ca299",
};
