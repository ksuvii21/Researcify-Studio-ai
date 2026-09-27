import {
  useMemo,
  useState,
} from "react";

import AIHeader from "../components/ai/AIHeader";
import AIConversationSidebar from "../components/ai/AIConversationSidebar";
import AIResearchModes from "../components/ai/AIResearchModes";
import AIChat from "../components/ai/AIChat";
import AIComposer from "../components/ai/AIComposer";
import AIContextPanel from "../components/ai/AIContextPanel";

import {
  aiContextDocuments,
  aiContextPapers,
  aiConversations,
  initialMessages,
  researchModes,
  suggestedPrompts,
} from "../data/aiMockData";

import "../components/ai/ai-assistant.css";

const AIAssistantPage = () => {
  const [project, setProject] =
    useState(
      "Artificial Intelligence in Education"
    );

  const [
    activeConversation,
    setActiveConversation,
  ] = useState("chat-001");

  const [activeMode, setActiveMode] =
    useState("research");

  const [messages, setMessages] =
    useState(initialMessages);

  const [composer, setComposer] =
    useState("");

  const [papers, setPapers] =
    useState(aiContextPapers);

  const [documents, setDocuments] =
    useState(aiContextDocuments);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const selectedSourceCount = useMemo(
    () =>
      papers.filter((paper) => paper.selected)
        .length +
      documents.filter(
        (document) => document.selected
      ).length,
    [papers, documents]
  );

  const togglePaper = (paperId) => {
    setPapers((current) =>
      current.map((paper) =>
        paper.id === paperId
          ? {
              ...paper,
              selected: !paper.selected,
            }
          : paper
      )
    );
  };

  const toggleDocument = (documentId) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === documentId
          ? {
              ...document,
              selected: !document.selected,
            }
          : document
      )
    );
  };

  const buildMockResponse = (question) => {
    const selectedPapers = papers.filter(
      (paper) => paper.selected
    );

    const sources = selectedPapers.map(
      (paper) => ({
        id: paper.id,
        title: paper.title,
      })
    );

    const modeResponses = {
      research:
        `Based on the selected research context, "${question}" can be explored through three major dimensions: the underlying research problem, the methodology used across the literature, and the unresolved questions that remain. A useful next step would be to organize the evidence by theme and identify where the selected studies agree or diverge.`,

      summarize:
        `The selected material suggests several recurring themes related to "${question}". The literature emphasizes the potential benefits of AI-supported learning while also highlighting concerns around explainability, trust, evaluation and responsible adoption. These themes can be grouped into technological, educational and ethical dimensions.`,

      compare:
        `For "${question}", the selected studies can be compared across research objective, methodology, evaluation criteria and reported outcomes. Their strongest overlap is the focus on AI-supported decision or learning processes, while differences emerge in how effectiveness and user trust are evaluated.`,

      gaps:
        `A potential research gap related to "${question}" is the limited connection between technical AI performance and long-term human outcomes. Existing work often evaluates model or system effectiveness, while fewer studies examine sustained trust, transparency, learning impact and real-world adoption together.`,
    };

    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: modeResponses[activeMode],
      sources,
    };
  };

  const submitPrompt = (promptValue) => {
    const question =
      (promptValue ?? composer).trim();

    if (!question || isGenerating) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setComposer("");
    setIsGenerating(true);

    window.setTimeout(() => {
      const response =
        buildMockResponse(question);

      setMessages((current) => [
        ...current,
        response,
      ]);

      setIsGenerating(false);
    }, 850);
  };

  const handleNewChat = () => {
    setMessages(initialMessages);
    setComposer("");
    setActiveConversation(null);
    setActiveMode("research");
  };

  return (
    <div className="ai-page">
      <AIHeader
        project={project}
        setProject={setProject}
      />

      <AIResearchModes
        modes={researchModes}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />

      <div className="ai-workspace">
        <AIConversationSidebar
          conversations={aiConversations}
          activeConversation={
            activeConversation
          }
          onSelect={
            setActiveConversation
          }
          onNewChat={handleNewChat}
        />

        <section className="ai-main">
          <AIChat
            messages={messages}
            prompts={suggestedPrompts}
            onPrompt={submitPrompt}
            isGenerating={isGenerating}
          />

          <AIComposer
            value={composer}
            setValue={setComposer}
            onSubmit={() => submitPrompt()}
            activeMode={activeMode}
            selectedSourceCount={
              selectedSourceCount
            }
            disabled={isGenerating}
          />
        </section>

        <AIContextPanel
          project={project}
          papers={papers}
          documents={documents}
          onTogglePaper={togglePaper}
          onToggleDocument={
            toggleDocument
          }
        />
      </div>
    </div>
  );
};

export default AIAssistantPage;