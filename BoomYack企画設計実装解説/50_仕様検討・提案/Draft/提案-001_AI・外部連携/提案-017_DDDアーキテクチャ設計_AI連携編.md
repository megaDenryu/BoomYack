---
type: Proposal
status: Draft
created: 2026-02-19
author: AI Agent
---
# 提案-017: DDDアーキテクチャ設計 (AI連携編)

## 1. 現状
- サーバーサイドの実装はこれから。
- クライアント側も `CanvasGraphModel` にロジックが集まりがち (`提案-001` で対処中)。

## 2. 問題点・課題
- AI連携機能は複雑度が高く、無秩序に実装するとスパゲッティコード化する。
- ドメインロジック（グラフの結合、分解、整列）がAPIハンドラに漏れ出すのを防ぐ必要がある。

## 3. 提案内容
サーバーサイド実装において、DDD (ドメイン駆動設計) の概念を取り入れ、責務を明確にする。

### 3-1. レイヤー構成
- **Interface Layer (FastAPI)**: HTTP/WebSocketハンドリング、DTO変換。
- **Application Layer (Services)**: ユースケースの実装 (`GraphExpansionService` 等)。
- **Domain Layer (Model)**: 
    - **Entities**: `Graph`, `GraphNode`
    - **Value Objects**: `GraphId`, `NodeContent`, `GraphContext`
    - **Domain Services**: `GraphMerger` (結合ロジック), `GraphLayoutCalculator`
- **Infrastructure Layer**: 
    - `JsonFileRepository`: ファイルシステムI/O。
    - `OpenAIGraphGenerator`: LLM APIとの通信。既存の `api/LLM/LLMAPIBase` (`切り替え可能LLMBox` 等) をラッパーとして再利用し、実装工数を削減する。
    - `ChromaVectorStore`: ベクトルDB操作。

### 3-2. 実装例 (Python)
```python
# Domain Object
class GraphNode(BaseModel):
    id: NodeId
    content: NodeContent
    links: LinkCollection

# Repository Interface
class IGraphRepository(ABC):
    @abstractmethod
    async def save(self, graph: Graph) -> None: ...

# Application Service
class GraphExpansionService:
    def __init__(self, repo: IGraphRepository, ai: IAIGraphGenerator): ...
    async def execute(self, command: ExpandGraphCommand): ...
```

## 4. 影響範囲
- サーバーサイドの全コード。
- ディレクトリ構造の設計。

## 5. 備考
- Pythonの型ヒント (`typing`) と Pydantic をフル活用し、堅牢な開発を行う。
