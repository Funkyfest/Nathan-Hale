# Private session record

Use this shape inside the owner's existing state store; it is not a new mandatory
filename or a public record. Extend the existing schema instead of replacing it.
Never commit real session data to the skill repository.

```json
{
  "session_id": "unique-local-session",
  "format": "visuals/layouts",
  "status": "awaiting_response",
  "completed_rounds": [],
  "pending_round": 1,
  "rounds": {
    "1": {
      "examples": {
        "A": {"label": "Example A", "source": null, "version_or_hash": null},
        "B": {"label": "Example B", "source": null, "version_or_hash": null}
      },
      "provenance": "proposed-comparison",
      "presentation": null,
      "recommendation": {"choice": "A", "why": null, "confidence": null},
      "submitted_selection": null,
      "choice": null,
      "rating": null,
      "user_rationale": null,
      "evidence_type": null,
      "interpretations": [],
      "great_acceptance": false,
      "acceptance_scope": null
    }
  },
  "capture": {
    "local_state": "pending",
    "library_registration": "not_requested",
    "memory_write": "not_requested",
    "memory_readback": "not_checked",
    "cloud_sync": "unverified"
  }
}
```

Use `Good`, `Great`, `Neither`, or null as the explicit quality value. A user can
choose a winner without rating it. Preserve the original submitted selection and
any overriding text separately from the resolved choice; keep correction history
when an answer changes. A prose statement saying only "I prefer B" leaves the
rating null. "B is Great, but use A for this task" contains different instructions:
record B's rating separately from any task choice, and do not execute the task as
part of the quiz.

`great_acceptance` is true only when an explicit Great rating identifies that
example. For a source with several candidates, record the candidate selector or
page as well as the file reference and version/hash. Never approve an entire
comparison file merely because one candidate earned Great.

An answered session can still have incomplete capture. Use a status such as
`answered_capture_pending` until authorized writes and readbacks are finished or
reported as blocked. An unavailable memory store does not erase received answers.
The public procedure may be shared; private state, source contents and identifiers
require their own destination-appropriate authorization.

Before closing, check meaningful cases against the actual records:

- A preferred example rated Good has no Great acceptance.
- No written explanation yields no invented rationale.
- A later Good winner does not silently downgrade an earlier Great example.
- A stale event for round 1 cannot overwrite the submitted round 3 answer.
- A saved widget value without a response does not advance the round.
- A rejected or uncertain memory write is not recorded as verified capture.
