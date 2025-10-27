import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateOfBirthPickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

const DateOfBirthPicker = ({
  value,
  onChange,
  label = "Date of Birth",
  required = false,
  placeholder = "Pick a date"
}: DateOfBirthPickerProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="dateOfBirth">
        {label} {required && "*"}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="dateOfBirth"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-card z-50" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateOfBirthPicker;
