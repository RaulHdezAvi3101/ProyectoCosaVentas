import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

interface FirstToClaimFieldsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  claimPhrase: string;
  onClaimPhraseChange: (value: string) => void;
  phraseHidden: boolean;
  onPhraseHiddenChange: (hidden: boolean) => void;
}

export function FirstToClaimFields({
  enabled,
  onEnabledChange,
  claimPhrase,
  onClaimPhraseChange,
  phraseHidden,
  onPhraseHiddenChange,
}: FirstToClaimFieldsProps) {
  return (
    <div className="rounded-xl border border-ink/10 bg-surface/60 p-4">
      <Checkbox
        name="firstToClaim"
        checked={enabled}
        onChange={(event) => onEnabledChange(event.target.checked)}
        label="Primero en reclamar"
        description="El primer comprador que escriba la frase correcta gana la reserva."
      />

      {enabled ? (
        <div className="mt-4 space-y-4 border-t border-ink/10 pt-4">
          <Input
            label="Frase clave"
            name="claimPhrase"
            value={claimPhrase}
            onChange={(event) => onClaimPhraseChange(event.target.value)}
            required={enabled}
            minLength={4}
            maxLength={64}
            placeholder="Ej. charizard-2026"
          />
          <Checkbox
            name="phraseHidden"
            checked={phraseHidden}
            onChange={(event) => onPhraseHiddenChange(event.target.checked)}
            label="Ocultar frase en la publicación"
            description="Los compradores verán ●●●●●● en lugar de la frase real."
          />
        </div>
      ) : null}
    </div>
  );
}
