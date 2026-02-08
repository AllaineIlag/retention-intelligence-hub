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

interface ResignationApprovalEmailProps {
    employeeName: string;
    interviewDate: string; // Formatted date string
    baseUrl?: string;
}

export const ResignationApprovalEmail = ({
    employeeName,
    interviewDate,
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL,
}: ResignationApprovalEmailProps) => (
    <Html>
        <Head />
        <Preview>Exit Interview Scheduled</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Exit Interview Scheduled</Heading>
                <Text style={text}>Dear {employeeName},</Text>
                <Text style={text}>
                    Your resignation has been processed, and your exit interview has been scheduled.
                </Text>
                <Section style={highlightSection}>
                    <Text style={highlightText}>Scheduled Date: {interviewDate}</Text>
                </Section>
                <Text style={text}>
                    Please log in to the portal 24 hours before your scheduled interview to review your answers. After that time, your responses will be locked for the final review.
                </Text>
                <Text style={text}>
                    You can access your dashboard below:
                </Text>
                <Button
                    style={button}
                    href={`${baseUrl}/exit-form`}
                >
                    View Dashboard
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

export default ResignationApprovalEmail;

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

const highlightSection = {
    backgroundColor: "#f4f4f4",
    borderRadius: "5px",
    padding: "16px",
    marginBottom: "24px",
    textAlign: "center" as const,
};

const highlightText = {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    color: "#000",
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
