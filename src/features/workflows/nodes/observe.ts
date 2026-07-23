import type { Stagehand } from "@browserbasehq/stagehand"

export async function observe({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction: string
}) {
  const result = await stagehand.observe(instruction)

  return {
    matches: result.map(({ selector, description }) => ({
      selector,
      description,
    })),
  }
}
