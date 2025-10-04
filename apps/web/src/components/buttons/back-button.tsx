"use client";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

const BackButton = () => {
  const { back } = useRouter();
  return (
    <Button  onClick={back} className="mb-4">
      <ArrowLeftIcon />
      <span>Back to Previous</span>
    </Button>
  );
};

export default BackButton;
