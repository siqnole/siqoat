# Interact

Hold **Ctrl** while clicking emoji choices in the emoji picker to select them. The selected emojis appear in a small Siqoat tray. Then click an emoji normally to send one native Stoat interaction message.

The plugin sends:

```json
{
  "content": null,
  "interactions": {
    "reactions": ["😀", "🎉"],
    "restrict_reactions": true
  }
}
```

Stoat renders the interaction choices with zero reactions until people choose one. Press **Escape** or click **clear** to cancel selection.

This uses same-origin browser credentials and the current channel ID from the Stoat URL. It intentionally only listens for picker elements exposing `data-emoji`, `data-emoji-id`, or `data-emoji-name` attributes.
