<script>
  import Nes from '@hapi/nes/lib/client';
  import dragula from "dragula";
  import { onMount } from 'svelte';

  import guid from "./generateGuid.js";

  import NavMenu from "./components/NavMenu.svelte";
  import TimesIcon from "./components/TimesIcon.svelte";
  import DropperIcon from "./components/DropperIcon.svelte";

  const protocol = window.location.protocol.indexOf('https') === -1 ? 'ws' : 'wss';
  const client = new Nes.Client(`${protocol}://${window.location.host}`);

  const cardColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "indigo",
    "purple",
    "pink"
  ];

  const defaultColor = "blue";

  // instantiate dragula, utilizing drop-column as class for the containers
  const drake = dragula({
    isContainer: function(el) {
      return el.classList.contains("drop-column");
    }
  });

  let connected = false

  // All the Stateful things...
  let notesColumns = [];

  let changeColor = "";

  // event handlers
  const addNote = index => () => {
    const id = guid();

    notesColumns[index].notes[notesColumns[index].notes.length] = {
      id,
      color: defaultColor,
      title: "Note Title Here",
      content: `Note Content Here ${id}`,
      contentHeight: null
    };

    sendChanges()
  };

  const deleteNote = (column, index) => () => {
    notesColumns[column].notes.splice(index, 1);
    notesColumns = notesColumns;

    sendChanges()
  };

  const addNoteColumn = () => {
    notesColumns[notesColumns.length] = {
      id: guid(),
      notes: []
    };

    sendChanges()
  };

  const showChangeColor = id => () => (changeColor = id);

  const changeNoteColor = (column, index, color) => () => {
    notesColumns[column].notes[index].color = color;
    changeColor = "";

    sendChanges()
  };

  const noteContentEdit = (column, index, type) => event => {
    notesColumns[column].notes[index][type] = event.target.value;

    sendChanges()
  };

  drake.on("drop", function(el, target, source, sibling) {
    const noteId = el.dataset.noteid;
    const targetColIndex = target.dataset.columnindex;
    const sourceColIndex = source.dataset.columnindex;

    // determine what order to place note in column
    const finalIndex = sibling
      ? sibling.dataset.index
      : notesColumns[targetColIndex].notes.length;

    const note = notesColumns[sourceColIndex].notes.find(n => n.id === noteId);

    // remote note from source column
    notesColumns[sourceColIndex].notes.splice(
      notesColumns[sourceColIndex].notes.indexOf(note),
      1
    );

    // add note to target column
    notesColumns[targetColIndex].notes.splice(finalIndex, 0, note);

    // finally update state
    notesColumns = notesColumns;

    sendChanges()
  });

  // catch and update textarea adjusted size in data
  const detectElementMouseEnlargement = (column, index) => ev => {
    const element = ev.target;
    const size = { height: element.clientHeight };
    let styleHeight = parseFloat(
      getComputedStyle(element)["height"].replace("px", "")
    );

    const mouseMoveListener = event => {
      if (element.clientHeight != size.height) {
        let style = getComputedStyle(element);
        styleHeight = parseFloat(style["height"].replace("px", ""));

        size.height = element.clientHeight;
      }
    };

    const mouseUpListener = event => {
      window.removeEventListener("mousemove", mouseMoveListener);
      window.removeEventListener("mouseup", mouseUpListener);
      notesColumns[column].notes[index].contentHeight = styleHeight;

      sendChanges()
    };

    window.addEventListener("mousemove", mouseMoveListener);
    window.addEventListener("mouseup", mouseUpListener);
  };

  const sendChanges = () => {
    client.request({
      method: "POST",
      path: `/treasuremap/5`,
      payload: {
        treasure: notesColumns
      }
    })
  }

  client.onConnect = async () => {
    if (connected) { return; }
    
    const results = await client.request(`/treasuremap/5`)

    notesColumns = results.payload.treasure

    connected = true; 
  }

  onMount(async () => {
    await client.connect();

    const handler = (update, flags) => {
        notesColumns = update.treasure
    };

    client.subscribe('/treasuremap/5', handler);
	})
</script>

<style>
  /** Manually including Dragula styles, should automate this later */
  :global(.gu-mirror) {
    position: fixed !important;
    margin: 0 !important;
    z-index: 9999 !important;
    opacity: 0.8;
    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=80)";
    filter: alpha(opacity=80);
  }

  :global(.gu-hide) {
    display: none !important;
  }

  :global(.gu-unselectable) {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
  }

  :global(.gu-transit) {
    opacity: 0.2;
    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=20)";
    filter: alpha(opacity=20);
  }
</style>

<div class="h-screen">
  <NavMenu />
  {#if connected}
    <section class="flex items-stretch min-h-full" style="overflow-x: scroll">
      {#each notesColumns as noteColumn, index}
        <div class="flex-no-shrink m-3" style="width: 320px">
          <button
            on:click={addNote(index)}
            class="w-full font-bold text-3xl text-grey bg-grey-lightest p-1">
            +
          </button>
          <ul
            class="drop-column list-reset w-full min-h-full"
            data-columnid={noteColumn.id}
            data-columnindex={index}>
            {#each noteColumn.notes as note, i (note.id)}
              <li
                class="max-w-xs shadow bg-{note.color}-lightest border border-{note.color}-lighter
                mt-5 list-reset"
                data-index={i}
                data-noteid={note.id}>
                <div class="p-3">
                  <div class="mb-2 relative flex mb-4">
                    <div class="w-1/4">
                      <button class="float-left" on:click={deleteNote(index, i)}>
                        <TimesIcon color={note.color} />
                      </button>
                    </div>
                    <div class="w-2/4">
                      <input
                        type="text"
                        value={note.title}
                        on:change={noteContentEdit(index, i, 'title')}
                        class="inline font-bold text-xl bg-transparent" />
                    </div>
                    <div class="w-1/4 text-right">
                      <button on:click={showChangeColor(note.id)}>
                        <DropperIcon color={note.color} />
                      </button>
                      {#if changeColor === note.id}
                        <div class="shadow border bg-white absolute pin-r">
                          {#each cardColors as color}
                            <button
                              on:click={changeNoteColor(index, i, color)}
                              class="p-3 hover:bg-{color}-lighter bg-{color}-lightest" />
                          {/each}
                        </div>
                      {/if}
                    </div>
                  </div>
                  <textarea
                    style="height: {note.contentHeight ? `${note.contentHeight}px` : 'auto'}"
                    on:mousedown={detectElementMouseEnlargement(index, i)}
                    class="w-full h-full bg-transparent"
                    rows="5"
                    on:change={noteContentEdit(index, i, 'content')}>{note.content}</textarea>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
      <div class="m-3 bg-grey-lightest w-16 self-stretch flex-no-shrink">
        <button
          on:click={addNoteColumn}
          class="w-full h-full font-bold text-5xl text-grey">
          +
        </button>
      </div>
    </section>
  {:else}
    <div class="pt-5 text-5xl font-bold text-green text-center">
      <h2>Connecting...</h2>
    </div>
  {/if}
</div>
