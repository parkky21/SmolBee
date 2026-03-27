from livekit.agents.metrics import LLMMetrics, STTMetrics, TTSMetrics, EOUMetrics
from rich.console import Console
from rich.table import Table
from rich import box
from datetime import datetime

console = Console()

async def on_tts_metrics_collected(metrics: TTSMetrics):
    table = Table(
        title="[bold blue]TTS Metrics Report[/bold blue]",
        box=box.ROUNDED,
        highlight=True,
        show_header=True,
        header_style="bold cyan"
    )

    table.add_column("Metric", style="bold green")
    table.add_column("Value", style="yellow")

    timestamp = datetime.fromtimestamp(metrics.timestamp).strftime('%Y-%m-%d %H:%M:%S')

    # table.add_row("Type", str(metrics.type))
    # table.add_row("Label", str(metrics.label))
    # table.add_row("Request ID", str(metrics.request_id))
    # table.add_row("Timestamp", timestamp)
    table.add_row("TTFB", f"[white]{metrics.ttfb:.4f}[/white]s")
    # table.add_row("Duration", f"[white]{metrics.duration:.4f}[/white]s")
    # table.add_row("Audio Duration", f"[white]{metrics.audio_duration:.4f}[/white]s")
    # table.add_row("Cancelled", "✓" if metrics.cancelled else "✗")
    table.add_row("Characters Count", str(metrics.characters_count))
    table.add_row("Streamed", "✓" if metrics.streamed else "✗")
    # table.add_row("Speech ID", str(metrics.speech_id))
    # table.add_row("Error", str(metrics.error))

    console.print("\n")
    console.print(table)
    console.print("\n")


async def on_stt_metrics_collected( metrics: STTMetrics) -> None:
    table = Table(
        title="[bold blue]STT Metrics Report[/bold blue]",
        box=box.ROUNDED,
        highlight=True,
        show_header=True,
        header_style="bold cyan"
    )

    table.add_column("Metric", style="bold green")
    table.add_column("Value", style="yellow")

    timestamp = datetime.fromtimestamp(metrics.timestamp).strftime('%Y-%m-%d %H:%M:%S')

    # table.add_row("Type", str(metrics.type))
    # table.add_row("Label", str(metrics.label))
    # table.add_row("Request ID", str(metrics.request_id))
    # table.add_row("Timestamp", timestamp)
    table.add_row("Duration", f"[white]{metrics.duration:.4f}[/white]s")
    # table.add_row("Speech ID", str(metrics.speech_id))
    # table.add_row("Error", str(metrics.error))
    table.add_row("Streamed", "✓" if metrics.streamed else "✗")
    table.add_row("Audio Duration", f"[white]{metrics.audio_duration:.4f}[/white]s")

    console.print("\n")
    console.print(table)
    console.print("\n")

async def on_eou_metrics_collected(metrics: EOUMetrics) -> None:
    table = Table(
        title="[bold blue]End of Utterance Metrics Report[/bold blue]",
        box=box.ROUNDED,
        highlight=True,
        show_header=True,
        header_style="bold cyan"
    )

    table.add_column("Metric", style="bold green")
    table.add_column("Value", style="yellow")

    timestamp = datetime.fromtimestamp(metrics.timestamp).strftime('%Y-%m-%d %H:%M:%S')

    # table.add_row("Type", str(metrics.type))
    # table.add_row("Label", str(metrics.label))
    # table.add_row("Timestamp", timestamp)
    table.add_row("End of Utterance Delay", f"[white]{metrics.end_of_utterance_delay:.4f}[/white]s")
    table.add_row("Transcription Delay", f"[white]{metrics.transcription_delay:.4f}[/white]s")
    # table.add_row("Speech ID", str(metrics.speech_id))
    # table.add_row("Error", str(metrics.error))

    console.print("\n")
    console.print(table)
    console.print("\n")

async def on_llm_metrics_collected(metrics: LLMMetrics) -> None:
    table = Table(
        title="[bold blue]LLM Metrics Report[/bold blue]",
        box=box.ROUNDED,
        highlight=True,
        show_header=True,
        header_style="bold cyan"
    )

    table.add_column("Metric", style="bold green")
    table.add_column("Value", style="yellow")

    timestamp = datetime.fromtimestamp(metrics.timestamp).strftime('%Y-%m-%d %H:%M:%S')

    # table.add_row("Type", str(metrics.type))
    # table.add_row("Label", str(metrics.label))
    # table.add_row("Request ID", str(metrics.request_id))
    # table.add_row("Timestamp", timestamp)
    # table.add_row("Duration", f"[white]{metrics.duration:.4f}[/white]s")
    table.add_row("Time to First Token", f"[white]{metrics.ttft:.4f}[/white]s")
    # table.add_row("Cancelled", "✓" if metrics.cancelled else "✗")
    # table.add_row("Completion Tokens", str(metrics.completion_tokens))
    # table.add_row("Prompt Tokens", str(metrics.prompt_tokens))
    # table.add_row("Total Tokens", str(metrics.total_tokens))
    table.add_row("Tokens/Second", f"{metrics.tokens_per_second:.2f}")

    console.print("\n")
    console.print(table)
    console.print("\n")