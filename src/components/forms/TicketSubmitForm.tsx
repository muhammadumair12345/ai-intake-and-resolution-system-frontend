"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketSchema, type TicketInput } from "@/lib/validations/schemas";
import {
  useCreateTicketMutation,
  useCheckDuplicatesMutation,
} from "@/lib/redux/api/ticketApi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TicketSubmitForm() {
  const router = useRouter();
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [checkDuplicates, { isLoading: isChecking }] =
    useCheckDuplicatesMutation();

  const [duplicateModal, setDuplicateModal] = useState<{
    show: boolean;
    data: any;
    formData: TicketInput | null;
  }>({ show: false, data: null, formData: null });

  const form = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      guestEmail: "",
      guestName: "",
      subject: "",
      initialMessage: "",
    },
  });

  const handleFinalSubmit = async (data: TicketInput) => {
    try {
      const response = await createTicket(data).unwrap();
      if (response.success && response.data) {
        toast.success(
          "Ticket submitted successfully! Check your email for the link."
        );
        router.push(`/ticket/${response.data.uniqueToken}`);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit ticket");
    }
  };

  const onSubmit = async (data: TicketInput) => {
    try {
      // Step 1: Check for duplicates
      const dupCheck = await checkDuplicates({
        guestEmail: data.guestEmail,
        subject: data.subject,
        message: data.initialMessage,
      }).unwrap();

      if (dupCheck.success && dupCheck.data?.hasDuplicates) {
        setDuplicateModal({
          show: true,
          data: dupCheck.data.similarTickets,
          formData: data,
        });
      } else {
        // No duplicates, proceed with submission
        await handleFinalSubmit(data);
      }
    } catch (error: any) {
      toast.error("AI check failed, but proceeding with submission...");
      await handleFinalSubmit(data);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Submit Support Request
          </CardTitle>
          <CardDescription className="text-lg">
            Describe your issue and our AI will route it to the right person.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief summary of the issue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide full details about your request..."
                        className="min-h-[150px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-6 text-lg font-semibold transition-all hover:scale-[1.01]"
                disabled={isCreating || isChecking}
              >
                {isCreating || isChecking ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2 border-white" />
                    {isChecking ? "AI Analyzing..." : "Submitting..."}
                  </>
                ) : (
                  "Submit Ticket"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Duplicate Modal */}
      <Dialog
        open={duplicateModal.show}
        onOpenChange={(open) =>
          !open && setDuplicateModal((prev) => ({ ...prev, show: false }))
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-yellow-600">
              Similar Tickets Found
            </DialogTitle>
            <DialogDescription>
              Our AI detected similar open tickets from you. Would you like to
              create a new one anyway?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            {duplicateModal.data?.map((ticket: any) => (
              <div
                key={ticket.id}
                className="p-3 border rounded-lg bg-yellow-50/50"
              >
                <p className="font-medium text-sm truncate">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground">
                  Similarity: {(ticket.similarity * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setDuplicateModal((prev) => ({ ...prev, show: false }))
              }
            >
              Go Back
            </Button>
            <Button
              onClick={() => {
                if (duplicateModal.formData) {
                  handleFinalSubmit(duplicateModal.formData);
                  setDuplicateModal((prev) => ({ ...prev, show: false }));
                }
              }}
            >
              Continue with New Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
