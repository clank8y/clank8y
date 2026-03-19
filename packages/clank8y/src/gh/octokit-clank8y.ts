import { Octokit } from 'octokit'
import { getClank8yRuntimeContext } from '../setup'

export async function clank8yOctokit(): Promise<Octokit> {
  return new Octokit({
    auth: getClank8yRuntimeContext().auth.githubToken,
  })
}
