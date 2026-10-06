import { render, screen, fireEvent } from "@testing-library/react";
import { ContentBlock } from "./ContentBlock";

describe("ContentBlock", () => {
  it("renders heading in view mode", () => {
    render(<ContentBlock block={{ id: "1", type: "heading", content: "Test Title" }} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders text in view mode", () => {
    render(<ContentBlock block={{ id: "2", type: "text", content: "Body content" }} />);
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("renders contenteditable heading in edit mode", () => {
    render(<ContentBlock block={{ id: "1", type: "heading", content: "Edit me" }} editable />);
    const heading = screen.getByText("Edit me");
    expect(heading).toHaveAttribute("contenteditable", "true");
  });

  it("calls onEdit when contenteditable content changes", () => {
    const onEdit = vi.fn();
    render(
      <ContentBlock
        block={{ id: "1", type: "heading", content: "Original" }}
        editable
        onEdit={onEdit}
      />
    );
    const heading = screen.getByText("Original");
    heading.textContent = "Updated";
    fireEvent.input(heading);
    expect(onEdit).toHaveBeenCalledWith("1", "Updated");
  });

  it("renders banner block with title and content", () => {
    render(
      <ContentBlock
        block={{
          id: "b1",
          type: "banner",
          title: "Banner Title",
          content: "Banner subtitle",
        }}
      />
    );
    expect(screen.getByText("Banner Title")).toBeInTheDocument();
    expect(screen.getByText("Banner subtitle")).toBeInTheDocument();
  });

  it("renders list block with items", () => {
    render(
      <ContentBlock
        block={{
          id: "l1",
          type: "list",
          content: "",
          items: ["One", "Two", "Three"],
        }}
      />
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });

  it("renders table block with rows", () => {
    render(
      <ContentBlock
        block={{
          id: "t1",
          type: "table",
          content: "",
          rows: [
            ["A", "B"],
            ["1", "2"],
          ],
        }}
      />
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders showcase block with title and content", () => {
    render(
      <ContentBlock
        block={{
          id: "s1",
          type: "showcase",
          title: "Feature",
          content: "Description",
        }}
      />
    );
    expect(screen.getByText("Feature")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders text block with content containing newlines and special chars", () => {
    const content = "Line one\nLine two & <script>";
    render(<ContentBlock block={{ id: "t1", type: "text", content }} />);
    expect(screen.getByText(/Line one/)).toBeInTheDocument();
    expect(screen.getByText(/Line two/)).toBeInTheDocument();
    expect(document.body.textContent).toContain("script");
  });

  it("renders image block with empty content in view mode", () => {
    const { container } = render(<ContentBlock block={{ id: "i1", type: "image", content: "" }} />);
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  describe("block settings affect render", () => {
    it("renders heading as h2 when settings.level is 2", () => {
      render(
        <ContentBlock
          block={{
            id: "1",
            type: "heading",
            content: "Subtitle",
            settings: { level: "2" },
          }}
        />
      );
      const el = screen.getByText("Subtitle");
      expect(el.tagName).toBe("H2");
    });

    it("renders heading as h3 when settings.level is 3", () => {
      render(
        <ContentBlock
          block={{
            id: "1",
            type: "heading",
            content: "Small",
            settings: { level: "3" },
          }}
        />
      );
      expect(screen.getByText("Small").tagName).toBe("H3");
    });

    it("renders list as ol when settings.listStyle is numbered", () => {
      render(
        <ContentBlock
          block={{
            id: "l1",
            type: "list",
            content: "",
            items: ["First", "Second"],
            settings: { listStyle: "numbered" },
          }}
        />
      );
      const list = screen.getByText("First").closest("ol");
      expect(list).toBeInTheDocument();
      expect(list?.tagName).toBe("OL");
    });

    it("renders list as ul when settings.listStyle is bullet", () => {
      render(
        <ContentBlock
          block={{
            id: "l1",
            type: "list",
            content: "",
            items: ["One"],
            settings: { listStyle: "bullet" },
          }}
        />
      );
      expect(screen.getByText("One").closest("ul")).toBeInTheDocument();
    });

    it("renders table caption when settings.caption is set", () => {
      render(
        <ContentBlock
          block={{
            id: "t1",
            type: "table",
            content: "",
            rows: [["H"], ["C"]],
            settings: { caption: "Sales 2024" },
          }}
        />
      );
      expect(screen.getByText("Sales 2024")).toBeInTheDocument();
      expect(document.querySelector("caption")).toHaveTextContent("Sales 2024");
    });

    it("table with settings.striped has even row styling", () => {
      const { container } = render(
        <ContentBlock
          block={{
            id: "t1",
            type: "table",
            content: "",
            rows: [
              ["A", "B"],
              ["1", "2"],
            ],
            settings: { striped: true },
          }}
        />
      );
      const tbody = container.querySelector("tbody");
      expect(tbody?.querySelector("tr")?.className).toMatch(/even:bg/);
    });

    it("image uses settings.alt for alt attribute", () => {
      const { container } = render(
        <ContentBlock
          block={{
            id: "i1",
            type: "image",
            content: "https://example.com/photo.jpg",
            settings: { alt: "A photo" },
          }}
        />
      );
      const img = container.querySelector('img[alt="A photo"]');
      expect(img).toBeInTheDocument();
    });
  });
});
