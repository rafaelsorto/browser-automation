import type { Stagehand } from "@browserbasehq/stagehand"

export async function agent({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction: string
}) {
  const browserAgent = stagehand.agent()
  const result = await browserAgent.execute(instruction)

  return {
    success: result.success,
    message: result.message,
    completed: result.completed,
  }
}
