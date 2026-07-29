import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  member: {
    memberId: string;
    name: string;
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
Package : ${member.package}
Position : ${member.position}
`;

    await navigator.clipboard.writeText(text);

    alert("Credentials copied successfully.");
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