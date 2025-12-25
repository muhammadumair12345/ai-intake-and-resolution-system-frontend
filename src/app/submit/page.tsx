import { TicketSubmitForm } from "@/components/forms/TicketSubmitForm";

export default function SubmitTicketPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Submit a Support Ticket
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Our AI-powered system will analyze your request and route it to the
            right expert immediately.
          </p>
        </div>
        <TicketSubmitForm />
      </div>
    </div>
  );
}
