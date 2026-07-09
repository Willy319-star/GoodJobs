import { notFound } from "next/navigation";
import { clearStabilityTestDataAction, seedStabilityTestDataAction } from "@/lib/actions/dev-seed";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  title: "\u7a33\u5b9a\u6027\u6d4b\u8bd5\u6570\u636e",
  description:
    "\u8fd9\u4e2a\u9875\u9762\u53ea\u5728\u672c\u5730\u5f00\u53d1\u73af\u5883\u53ef\u7528\u3002\u70b9\u51fb\u751f\u6210\u540e\uff0c\u4f1a\u7ed9\u5f53\u524d\u767b\u5f55\u8d26\u53f7\u521b\u5efa 30 \u6761\u6295\u9012\u8bb0\u5f55\u548c 10 \u6761\u63d0\u9192\uff0c\u5176\u4e2d\u524d 10 \u6761\u6295\u9012\u6e20\u9053\u4e3a\u516c\u53f8\u5b98\u7f51\uff0c\u5e76\u5e26\u5c97\u4f4d\u94fe\u63a5\u3002\u6d4b\u8bd5\u6570\u636e\u4f1a\u5e26\u6709 GoodJobs stability test \u6807\u8bb0\uff0c\u65b9\u4fbf\u6e05\u7406\u3002",
  seed: "\u751f\u6210 30 \u6761\u6295\u9012 + 10 \u4e2a\u63d0\u9192",
  clear: "\u6e05\u7406\u7a33\u5b9a\u6027\u6d4b\u8bd5\u6570\u636e",
  successTitle: "\u64cd\u4f5c\u6210\u529f",
  errorTitle: "\u64cd\u4f5c\u5931\u8d25",
  created: "\u5df2\u751f\u6210 30 \u6761\u6295\u9012\u548c 10 \u4e2a\u63d0\u9192\u3002\u53ef\u4ee5\u53bb\u9996\u9875\u3001\u6295\u9012\u8bb0\u5f55\u3001\u65f6\u95f4\u7ebf\u548c\u63d0\u9192\u9875\u68c0\u67e5\u3002",
  cleared: "\u5df2\u6e05\u7406\u7a33\u5b9a\u6027\u6d4b\u8bd5\u6570\u636e\u3002",
};

async function getMessage(searchParams?: PageProps["searchParams"]) {
  const params = await searchParams;
  const status = Array.isArray(params?.status) ? params.status[0] : params?.status;
  const message = Array.isArray(params?.message) ? params.message[0] : params?.message;

  if (status === "success") {
    return {
      type: "success" as const,
      title: copy.successTitle,
      description: message === "cleared" ? copy.cleared : copy.created,
    };
  }

  if (status === "error") {
    return {
      type: "error" as const,
      title: copy.errorTitle,
      description: message ? decodeURIComponent(message) : "\u672a\u77e5\u9519\u8bef\u3002",
    };
  }

  return null;
}

export default async function DevSeedPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const message = await getMessage(searchParams);

  return (
    <AppShell track="campus">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {message ? (
          <div
            className={cn(
              "rounded-lg border p-4 text-sm",
              message.type === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-blue-100 bg-blue-50 text-blue-900",
            )}
          >
            <p className="font-medium">{message.title}</p>
            <p className="mt-1 leading-6">{message.description}</p>
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{copy.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="text-sm leading-6 text-muted-foreground">{copy.description}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <form action={seedStabilityTestDataAction}>
                <Button type="submit">{copy.seed}</Button>
              </form>
              <form action={clearStabilityTestDataAction}>
                <Button type="submit" variant="outline">
                  {copy.clear}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
