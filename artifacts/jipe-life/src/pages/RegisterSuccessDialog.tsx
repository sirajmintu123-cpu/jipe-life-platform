import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import jsPDF from "jspdf";

interface Props {
  open: boolean;
  onClose: () => void;
  member: {
    memberId: string;
    name: string;
    sponsorId: string;
    sponsorName: string;
    password: string;
    package: string;
    pv: string;
    position: string;
    registerTime: string;
  };
}

export default function RegisterSuccessDialog({
  open,
  onClose,
  member,
}: Props) {
  const copyCredentials = async () => {
    const text = `
Member ID : ${member.memberId}
Password : ${member.password}
Name : ${member.name}
Sponsor : ${member.sponsorId}
Package : ${member.package}
Position : ${member.position}
`;

    await navigator.clipboard.writeText(text);

    alert("Credentials copied successfully.");
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text("JIPE LIFE", 70, 20);

    pdf.setFontSize(14);

    pdf.text(`Member ID : ${member.memberId}`,20,40);
    pdf.text(`Name : ${member.name}`,20,50);
    pdf.text(`Password : ${member.password}`,20,60);
    pdf.text(`Sponsor : ${member.sponsorId}`,20,70);
    pdf.text(`Package : ${member.package}`,20,80);
    pdf.text(`Position : ${member.position}`,20,90);
    pdf.text(`Registered : ${member.registerTime}`,20,100);

    pdf.save(`${member.memberId}.pdf`);
  };

  return (
    <Dialog
  open={open}
  onOpenChange={(value) => {
    if (!value) {
      onClose();
    }
  }}
>

      <DialogContent className="max-w-md rounded-3xl">

        <motion.div
          initial={{ scale: .7, opacity:0 }}
          animate={{ scale:1, opacity:1 }}
          transition={{ duration:.4 }}
        >

          <div className="text-center">

            <div className="text-6xl mb-4">
                🎉
            </div>

            <h2 className="text-2xl font-bold text-green-600">
              Registration Successful
            </h2>

            <div className="mt-6 rounded-xl border p-4 space-y-2">

              <div>
                <b>Member ID</b>

                <div className="text-2xl text-blue-700 font-bold">
                  {member.memberId}
                </div>

              </div>

              <div>Password : {member.password}</div>

              <div>
                Sponsor :
                {member.sponsorId}
                {" - "}
                {member.sponsorName}
              </div>

              <div>
                Package :
                {member.package}
                {" "}
                ({member.pv})
              </div>

              <div>
                Position :
                {member.position}
              </div>

              <div>
                Registered :
                {member.registerTime}
              </div>

            </div>

            <div className="grid gap-3 mt-6">

              <Button onClick={copyCredentials}>
                📋 Copy Credentials
              </Button>

              <Button
                variant="secondary"
                onClick={downloadPDF}
              >
                📄 Download PDF
              </Button>

              <Button
                onClick={onClose}
              >
                Go To Login
              </Button>

            </div>

          </div>

        </motion.div>

      </DialogContent>

    </Dialog>
  );
}