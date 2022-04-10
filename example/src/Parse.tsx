import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import reactTextareaAutosize from "react-textarea-autosize";
import { parseMetar, IMetar, Locale } from "metar-taf-parser";
import ReactJson from "react-json-view";
import Error from "./Error";
import { useNavigate } from "react-router";
import { createSearchParams, useSearchParams } from "react-router-dom";
import en from "metar-taf-parser/dist/locale/en";
import fr from "metar-taf-parser/dist/locale/fr";
import de from "metar-taf-parser/dist/locale/de";
import it from "metar-taf-parser/dist/locale/it";
import pl from "metar-taf-parser/dist/locale/pl";
import zh from "metar-taf-parser/dist/locale/zh-CN";
import { css } from "@emotion/react";

// Types are broke
const Json = ReactJson as any;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  margin-top: 1.5rem;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
`;

const common = css`
  font-size: inherit;
  height: 40px;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  appearance: none;
  background: none;
  color: inherit;
`;

const Button = styled.button`
  ${common}

  white-space: nowrap;
  margin-right: 0.5rem;
  cursor: pointer;
`;

const Select = styled.select`
  ${common}

  padding-right: 2.5rem;
  border-radius: 1.5rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 512' width='8'%3E%3Cpath d='M310.6 246.6l-127.1 128C176.4 380.9 168.2 384 160 384s-16.38-3.125-22.63-9.375l-127.1-128C.2244 237.5-2.516 223.7 2.438 211.8S19.07 192 32 192h255.1c12.94 0 24.62 7.781 29.58 19.75S319.8 237.5 310.6 246.6z' fill='rgba(255, 255, 255, 0.25)'/%3E%3C/svg%3E");
  background-position: 87%;
  background-repeat: no-repeat;

  option {
    color: black;
  }
`;

const Textarea = styled(reactTextareaAutosize)`
  width: 100%;
  min-height: 50px;

  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  resize: none;
  padding: 1rem;
  color: inherit;
  font-family: monospace;
  font-size: inherit;
`;

const JsonContainer = styled.div`
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;

  overflow: hidden;

  .react-json-view {
    padding: 1rem;
    width: 100%;
  }
`;

const EXAMPLE =
  "KTTN 051853Z 04011KT 1 1/2SM VCTS SN FZFG BKN003 OVC010 M02/M02 A3006 RMK AO2 TSB40 SLP176 P0002 T10171017=";

const langs = [
  { name: "en", locale: en, label: "🇬🇧 English" },
  { name: "fr", locale: fr, label: "🇫🇷 Français" },
  { name: "de", locale: de, label: "🇳🇱 Nederlands" },
  { name: "it", locale: it, label: "🇮🇹 Italiano" },
  { name: "pl", locale: pl, label: "🇵🇱 Polskie" },
  { name: "zh", locale: zh, label: "🇨🇳 中国人" },
];

function findLocale(selectedName: string): Locale | undefined {
  return langs.find(({ name }) => name === selectedName)?.locale;
}

export default function Parse() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(search.get("input") || "");
  const [metar, setMetar] = useState<IMetar | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    try {
      if (input) setMetar(parseMetar(input, { locale: findLocale(lang) }));
      else setMetar(undefined);

      setError(undefined);
    } catch (e) {
      setError(e as Error);
      setMetar(undefined);
      console.error(e);
    }

    navigate(
      { search: input ? createSearchParams({ input }).toString() : undefined },
      { replace: true }
    );
  }, [input, navigate, lang]);

  return (
    <Container>
      <InputContainer>
        <div>
          <Button onClick={() => setInput(EXAMPLE)}>Autofill example</Button>
          <Button onClick={() => setInput("")}>Clear</Button>
          <Select value={lang} onChange={(e) => setLang(e.target.value)}>
            {langs.map((lang) => (
              <option key={lang.name} value={lang.name}>
                {lang.label}
              </option>
            ))}
          </Select>
        </div>
        <Textarea
          onChange={(e) => {
            setInput(e.target.value);
          }}
          value={input}
          placeholder="Enter METAR string"
        />
      </InputContainer>

      {error && <Error error={error} />}

      <JsonContainer>
        <Json
          // Hide undefined values from displaying
          src={metar ? JSON.parse(JSON.stringify(metar)) : metar}
          theme="harmonic"
          enableClipboard={false}
        />
      </JsonContainer>
    </Container>
  );
}
