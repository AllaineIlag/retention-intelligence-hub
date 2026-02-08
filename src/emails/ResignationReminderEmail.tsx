import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Text,
    Section,
    Button,
} from "@react-email/components";
import * as React from "react";

interface ResignationReminderEmailProps {
    employeeName: string;
    interviewDate: string; // Formatted date string
}

export const ResignationReminderEmail = ({
    employeeName,
    interviewDate,
}: ResignationReminderEmailProps) => (
    <Html>
        <Head />
        <Preview>Reminder: Upcoming Exit Interview</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Upcoming Exit Interview Reminder</Heading>
                <Text style={text}>Dear {employeeName},</Text>
                <Text style={text}>
                    This is a reminder that your exit interview is scheduled for:
                </Text>
                <Section style={highlightSection}>
                    <Text style={highlightText}>{interviewDate}</Text>
                </Section>
                <Text style={text}>
                    <strong>Important:</strong> Your exit form answers will be officially <strong>LOCKED</strong> 24 hours before this time.
                </Text>
                <Text style={text}>
                    We recommend reviewing your answers now to ensure they accurately reflect your feedback before the lock period begins.
                </Text>
                <Button
                    style={button}
                    href={`${process.env.NEXT_PUBLIC_SITE_URL}/exit-form`}
                >
                    Review My Answers
                </Button>
                <Section style={footer}>
                    <Text style={footerText}>
                        Retention Intelligence Hub
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default ResignationReminderEmail;

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
    color: "#d93025", // Alert color
};

const text = {
    fontSize: "16px",
    lineHeight: "1.4",
    color: "#484848",
    marginBottom: "24px",
};

const highlightSection = {
    backgroundColor: "#fff0f0", // Light red background
    borderRadius: "5px",
    padding: "16px",
    marginBottom: "24px",
    textAlign: "center" as const,
    border: "1px solid #ffcccc",
};

const highlightText = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    color: "#d93025",
};

const button = {
    backgroundColor: "#000000",
    borderRadius: "5px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "100%",
    padding: "12px",
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
