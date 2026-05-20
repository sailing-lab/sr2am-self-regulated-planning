# SR²AM: Efficient Agentic Reasoning Through Self-Regulated Simulative Planning

Project page for **SR²AM** (Self-Regulated Simulative Reasoning Agentic LLM), a decomposition of agentic decision-making into three interacting systems:

- **System III — Self-Regulation:** a learned configurator decides when and how deeply to plan.
- **System II — Simulative Reasoning:** a planner predicts future states using the LLM as a world model.
- **System I — Reactive Execution:** free-form reasoning and direct action.

Across mathematical, scientific, tabular, and web-information-seeking tasks, SR²AM-v0.1-8B and SR²AM-v1.0-30B achieve Pass@1 competitive with systems at 120–355B and 685B–1T parameters respectively, while SR²AM-v1.0-30B uses 25.8–95.3% fewer reasoning tokens than competitive agentic LLMs of similar scale.

## Links

- Project page: <https://sr2am-agentic-llm.github.io>
- Code: <https://github.com/sailing-lab/sr2am>
- Models: [SR²AM-v0.1-8B](https://huggingface.co/sailing-lab/SR2AM-v0.1-8B) · [SR²AM-v1.0-30B](https://huggingface.co/sailing-lab/SR2AM-v1.0-30B)

## Authors

Mingkai Deng, Jinyu Hou, Lara Sá Neves, Varad Pimpalkhute, Taylor W. Killian, Zhengzhong Liu, Eric P. Xing.
Institute of Foundation Models · Carnegie Mellon University.

## Local preview

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```
