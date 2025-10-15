import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ComparisonChartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frontedTotal: number;
  currency: string;
}

export const ComparisonChart = ({
  open,
  onOpenChange,
  frontedTotal,
  currency,
}: ComparisonChartProps) => {
  const competitorFlatFee = 599; // Example flat fee in USD

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cost Comparison</DialogTitle>
          <DialogDescription>
            Educational comparison - actual competitor pricing may vary.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Fronted (computed)</TableCell>
              <TableCell className="text-right font-mono">
                {currency} {frontedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Example Competitor</TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">
                ${competitorFlatFee}/month flat
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-2">
          This is an educational comparison and not a sales claim. Actual competitor pricing may differ.
        </p>
      </DialogContent>
    </Dialog>
  );
};
