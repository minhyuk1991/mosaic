<script lang="ts">
export let update: () => void;
export let node;
</script>

<div
  style="{`inset: ${node.second.boundingBox.top}% ${node.second.boundingBox.right}% ${node.second.boundingBox.bottom}% ${node.second.boundingBox.left}%`}"
  class="{`${
    node?.derection === 'row'
      ? 'right-[-6px] top-0 h-full w-[6px]'
      : 'bottom-[-6px] h-[7px] w-full'
  }  absolute  z-10 bg-red-500`}">
</div>
