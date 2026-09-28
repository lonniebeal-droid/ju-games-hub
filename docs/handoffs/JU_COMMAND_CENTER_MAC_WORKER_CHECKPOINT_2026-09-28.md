# JU COMMAND CENTER — MAC WORKER CHECKPOINT
**Date:** 2026-09-28 17:20 ET  
**Durable fallback:** GitHub handoff while Google Drive JU Master write is blocked by quota  
**Scope:** Mac Command Center autonomous worker lane only

## Current verified state

- Mac Command Center bridge is running from LaunchAgent: `com.ju.command-execution-bridge`.
- Single active bridge process verified after killing manual duplicate process.
- Local queue path verified: `~/.ju_commander/queue/inbound.jsonl`.
- Local queue state file verified: `~/JU_COMMAND_CENTER/.ju-local-queue-offset`.
- Bridge file compiles after patches: `python3 -m py_compile command_execution_bridge.py`.
- Duplicate local queue claim protection was added and verified with duplicate canary `CANARY-DEDUPE-20260928-1701`:
  - one `local_queue_claim`
  - one `command_dispatched`
  - duplicate row logged as `local_queue_duplicate_skip`
- Single-instance canary `CANARY-SINGLE-20260928-1707` verified:
  - one bridge process
  - one local queue claim
  - one dispatch
  - duplicate skip worked on duplicate submission
- Task-body patch attempt compiled and restarted LaunchAgent cleanly.
- Canary `CANARY-TASKBODY-20260928-1716` verified local queue claim, dispatch, and `worker_start`.

## Current blocker

The final verifier/receipt path is not yet fully verified for the latest local queue canary.

Observed for `CANARY-TASKBODY-20260928-1716`:

```json
{"event":"local_queue_claim","local_id":"CANARY-TASKBODY-20260928-1716","row":-15}
{"event":"command_dispatched","row":-15,"source":"local_queue"}
{"event":"worker_start","row":-15,"task":"task body verifier test"}
```

Missing evidence:

- `worker_exit`
- `make_completion_verification_dispatch`
- receipt file update for the latest canary
- full local queue `task` body appearing in `worker_start`; it still showed title text only

## Root cause identified

`poll_local_queue()` reads the local JSON entry, but `execute(row, cmd, name)` reconstructs `ADD_TASK` from `name` instead of using the full local payload body. This drops the JSON `task` field before worker/verifier receipt flow.

## Patch direction

Add a per-process `LOCAL_PAYLOADS={}` map near `ALLOWED`, store the full local JSON entry by negative row id in `poll_local_queue()`, then make `execute()` prefer `LOCAL_PAYLOADS[row]` for local `ADD_TASK` rows.

Required behavior:

- `worker_start` should show the full local task body, for example `PAYLOAD BODY FINAL TEST...`, not just `payload body final test`.
- Then verify `worker_exit` and `make_completion_verification_dispatch` appear for the same canary.

## Safety rules

Do not execute destructive/account-auth/purchase/deletion/approval-gated tasks without Ju. Keep tests harmless canaries only until full unattended path passes.

## Exact next terminal test

After applying the `LOCAL_PAYLOADS` patch and restarting the LaunchAgent, enqueue:

```bash
printf '{"id":"CANARY-PAYLOAD-20260928-1720","command":"ADD_TASK","title":"payload body final test","task":"PAYLOAD BODY FINAL TEST: harmless verifier receipt proof. Full task body must reach worker_start, worker_exit, verifier, and receipt. No deletion, purchase, auth, production change, or account action."}\n' >> "$HOME/.ju_commander/queue/inbound.jsonl"
```

Then inspect:

```bash
tail -n 180 worker-logs/command_execution_bridge.log | grep "CANARY-PAYLOAD-20260928-1720\|PAYLOAD BODY FINAL TEST\|payload body final test\|local_queue_claim\|command_dispatched\|worker_start\|worker_exit\|make_completion_verification_dispatch"
```

Acceptance for this checkpoint:

- one bridge process
- one claim
- one dispatch
- `worker_start` contains the full payload body
- `worker_exit` appears
- `make_completion_verification_dispatch` appears
- receipt path updated
