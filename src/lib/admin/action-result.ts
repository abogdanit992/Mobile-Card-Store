export type ActionResult = { ok: boolean; message: string } | null;

export type AdminAction = (
  prev: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;
