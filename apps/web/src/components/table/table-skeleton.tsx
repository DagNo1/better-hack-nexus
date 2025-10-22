import { Skeleton } from "@workspace/ui/components/skeleton";
import { TableCell, TableRow } from "@workspace/ui/components/table";

// Export LoadingRows for backward compatibility
export function LoadingTableRows({
  count = 6,
  columnsCount = 5
}: {
  count?: number;
  columnsCount?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: columnsCount }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default LoadingTableRows;
