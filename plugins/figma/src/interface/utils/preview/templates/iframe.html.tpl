<!doctype html>
<html class="__CURRENT_FIGMA_THEME__">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Component Previewer</title>
    <link rel="preconnect" href="https://rsms.me/">
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    <style>
      :root {
        font-family: Inter, sans-serif;
        font-feature-settings: 'liga' 1, 'calt' 1; /* fix for Chrome */
      }
      @supports (font-variation-settings: normal) {
        :root { font-family: InterVariable, sans-serif; }
      }
      html {
        width: 100%;
        height: 100%;
        background-size: 16px 16px;
        background-color: rgb(242, 242, 242);
        background-image: linear-gradient(45deg, rgb(255, 255, 255) 25%, transparent 25%), linear-gradient(-45deg, rgb(255, 255, 255) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(255, 255, 255) 75%), linear-gradient(-45deg, transparent 75%, rgb(255, 255, 255) 75%);
        background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        transition: background-size 0.2s ease-out, background-position 0.2s ease-out;
        will-change: background-size, background-position;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      html.dark {
        background-color: rgb(31, 31, 31);
        background-image: linear-gradient(45deg, rgb(43, 43, 43) 25%, transparent 25%), linear-gradient(-45deg, rgb(43, 43, 43) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(43, 43, 43) 75%), linear-gradient(-45deg, transparent 75%, rgb(43, 43, 43) 75%);
      }
      body, #previewer, #previewer > div {
        margin: 0;
        width: 100%;
        height: 100%;
      }
      #wrapper {
        position: relative;
      }
      #diff {
        position: absolute;
        overflow: hidden;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      #handle {
        position: absolute;
        top: 0;
        left: 50%;
        width: 6px;
        height: 100%;
        background-color: rgba(151, 71, 255, 0.2);
        cursor: col-resize !important;
        transform: translateX(-50%);
        z-index: 100;
        transition: background-color 0.2s ease;
        will-change: background-color;
        backface-visibility: hidden;
        border-radius: 9999px;
      }
      #handle:hover, #handle:active {
        background-color: rgba(151, 71, 255, 0.8);
      }
      *:active, *:focus {
        outline: none;
      }
    </style>
    <style>
     .root {
        width: 100%;
        height: 20px;
        cursor: pointer;
        display: flex;
        position: relative;
        align-items: center;
        user-select: none;
        touch-action: none;
      }
      .track {
        height: 4px;
        position: relative;
        flex-grow: 1;
        border-radius: 9999px;
        background-color: #D2D6D8;
      }
      .range {
        height: 100%;
        position: absolute;
        border-radius: 9999px;
        background-color: #5A48F5;
      }
      .thumb {
        width: 9.5px;
        height: 9.5px;
        display: block;
        border-radius: 9999px;
        background-color: #5A48F5;
        box-shadow: #FFFFFF 0 0 0 4.5px;
        transition: scale .3s ease;
      }
      .thumb:hover {
        scale: 1.1;
      }
      .thumb:active {
        scale: 1.3;
      }
      .thumb:focus {
        outline: none;
      }
    </style>
    <style>
      body {
        cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABW9JREFUeF7tWs9PY1UYPa0yarWI7ZRAJezrj7AwJiQkBoYxbkxc+Ce4wQ2GiAQSDLCZUosGpxJk3JoYE3UjiQsV6KJEVkacRHQFJLQJUBXEDoxizan3Izcv/fVa83oL7yY3faU/3v3Od873nXuLB1d8eK54/HABKMEAAmMFJ6/eK4+XgjzWICVwL4AHFAj8G4Pm/EeblwIIHQBeM/AHOY+Pjyf9fv/42dlZKpfLpbxeb76tre0WgL8BnKtJQAScpmSEDgCDbwFwLZvNvh0IBN4qFtHh4eFcKBSKAvjLAoYA0VTMEAD4SMo/BMCXz+f3Gfz09DRmZmYwNTVVuNbH6enpOpkRDAaFFcIMkUlTAKEDcA3AIwD8R0dHn7e2tj4/MDCAtbW1i7gJhACjg7G/v/9uS0vLeSAQKAaG0RIRAEh/AvAogLZsNvtpIBB4ThhQTAqlwGg2iegAkP4E4InFxcWXhoaGEsw+WVBpNLNErAx4jAAAaE+n0x92dnY+Y5VBOTBqlAhrRsOGtQYUJAAglMlkPuro6Hi2WhZYI6ggEdYK6SIsnlI4HQdCb4NsgSyCjwMIxuPxF0dHR9/hijye+hxzKYlsb29HI5HIigKD3sJxNuiRsQ0+DIAyCFAGe3t7C+Fw+Gk7MrArkc3NzVd6enq+BXBfM1eOMcHqBC86AWUQjUZvjI+P36pVBpXAYJc5OTn5zu/3vwzgHoAzBUJDAOBNaYMpg1YA1wlCPp//mi/8XyyQyPr7+7G6ulp46vF4ngRwokBgTXDMRFnFTT/AdigyCKXT6UV2g3KeoNp0MWgO1gS53traWopEIrTWxwBySgoNA4CAsBj6VDG8HovFbo6Njc3WIgM9YAYuzwWwg4ODH9rb218DkAVwZAIAXBuLYcESsxuoYni72mLIIKUFWgPml+/u7v68tLT0hc/ny01OTqZU8L8pBrAOsD02jAEFSSoZFFwh60A6nb5DGVRiQbF2t7Oz88vCwsKXXq/3PBaL3VUUZ6DUPGnPzEv2T9UOs1pV1f2+Ug1eZFAohvF4/GY1nkAAWF5e/iqZTP40Nzf3owqYLU6fBIB6/1NNXjN4Zt9RL1AKAPEElIF4gg8qySCf/4+5ExMTsdnZ2e9VVWewDE4HgO2Ok3/nI1+T7bRj9Be6F6MRgbHtCQQAj8fzKoA/FM317DLDYoH1a3GBjgZfDgDbnkDov7Ky8tng4OAdACxsBIE0F4NjPU5j4HLWWLeea/mCcibflicQANbX1z/p6+u7rQDQe7t+oCo6dzzjVpDKAWDLEwj95+fn3xwZGfkGwK+KAawB4u4aHrAdAGx5Ak3/LwDgmSIBYKsj/R2t7HakUGmfW5UnsND/fQAHSgIsgATA2FEJAC68oicQADY2Nj7u7e19D8ChMjfi7JoaAN0TFI7L5JyAG6RkMnmxq0skEiPDw8PcPdLbswOwz7PSGzuqYYDuCXhaxA3SDW6Q9KhU9U8o+v+u9E+DY6z+K/kAPT45J5BD02AqlXq9u7u7p6ur66lMJnM3HA6/oTLP4iftj2bH6FENAxiA/G7AbTL3Bzw45SN3jfwOFjpSnpnnxkY3P5cCAAZJFtAeEwQygZPP+RozzYrPtsfgZWNjXN+36wP098svxwyah6ecBIUAsNDpmxsCYnTxk8CqlYC8/+Lnc9Ue2SE4WOjo9iRw8fhG099OEbQygUBwEkDOpv3nCbsM0IEo9lnjNV9PDTCezrUssB4G1HI/4z7jAmBcShxekMsAhwE37nYuA4xLicMLchngMODG3c5lgHEpcXhBLgMcBty427kMMC4lDi/IZYDDgBt3O5cBxqXE4QW5DHAYcONu5zLAuJQ4vKArz4B/AZ+QWF9iEpilAAAAAElFTkSuQmCC')
            4 4,
          auto !important;
        cursor: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4Ij48aW1hZ2UgeGxpbms6aHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFFQUFBQUJBQ0FZQUFBQ3FhWEhlQUFBQUFYTlNSMElBcnM0YzZRQUFCVzlKUkVGVWVGN3RXczlQWTFVWVBhMHlhcldJN1pSQUplenJqN0F3SmlRa0JvWXhia3hjK0NlNHdRMkdpQVFTRExDWlVvc0dweEprM0pvWUUzVWppUXNWNktKRVZrYWNSSFFGSkxRSlVCWEVEb3hpemFuM0l6Y3YvZlZhODNvTDd5WTNmYVUvM3YzT2Q4NzNuWHVMQjFkOGVLNTQvSEFCS01FQUFtTUZKNi9lSzQrWGdqeldJQ1Z3TDRBSEZBajhHNFBtL0VlYmx3SUlIUUJlTS9BSE9ZK1BqeWY5ZnYvNDJkbFpLcGZMcGJ4ZWI3NnRyZTBXZ0w4Qm5LdEpRQVNjcG1TRURnQ0Rid0Z3TFp2TnZoMElCTjRxRnRIaDRlRmNLQlNLQXZqTEFvWUEwVlRNRUFENFNNby9CTUNYeitmM0dmejA5RFJtWm1Zd05UVlZ1TmJINmVucE9wa1JEQWFGRmNJTWtVbFRBS0VEY0EzQUl3RDhSMGRIbjdlMnRqNC9NRENBdGJXMWk3Z0poQUNqZzdHL3YvOXVTMHZMZVNBUUtBYUcwUklSQUVoL0F2QW9nTFpzTnZ0cElCQjRUaGhRVEFxbHdHZzJpZWdBa1A0RTRJbkZ4Y1dYaG9hR0VzdytXVkJwTkxORXJBeDRqQUFBYUUrbjB4OTJkblkrWTVWQk9UQnFsQWhyUnNPR3RRWVVKQUFnbE1sa1B1cm82SGkyV2haWUk2Z2dFZFlLNlNJc25sSTRIUWRDYjROc2dTeUNqd01JeHVQeEYwZEhSOS9oaWp5ZStoeHpLWWxzYjI5SEk1SElpZ0tEM3NKeE51aVJzUTArRElBeUNGQUdlM3Q3QytGdytHazdNckFya2MzTnpWZDZlbnErQlhCZk0xZU9NY0hxQkM4NkFXVVFqVVp2akkrUDM2cFZCcFhBWUpjNU9UbjV6dS8zdnd6Z0hvQXpCVUpEQU9CTmFZTXBnMVlBMXdsQ1BwLy9taS84WHl5UXlQcjcrN0c2dWxwNDZ2RjRuZ1J3b2tCZ1RYRE1SRm5GVFQvQWRpZ3lDS1hUNlVWMmczS2VvTnAwTVdnTzFnUzUzdHJhV29wRUlyVFd4d0J5U2dvTkE0Q0FzQmo2VkRHOEhvdkZibzZOamMzV0lnTTlZQVl1endXd2c0T0RIOXJiMjE4RGtBVndaQUlBWEJ1TFljRVNzeHVvWW5pNzJtTElJS1VGV2dQbWwrL3U3djY4dExUMGhjL255MDFPVHFaVThMOHBCckFPc0QwMmpBRUZTU29aRkZ3aDYwQTZuYjVER1ZSaVFiRjJ0N096ODh2Q3dzS1hYcS8zUEJhTDNWVVVaNkRVUEduUHpFdjJUOVVPczFwVjFmMitVZzFlWkZBb2h2RjQvR1kxbmtBQVdGNWUvaXFaVFA0ME56ZjNvd3FZTFU2ZkJJQjYvMU5OWGpONFp0OVJMMUFLQVBFRWxJRjRnZzhxeVNDZi80KzVFeE1Uc2RuWjJlOVZWV2V3REU0SGdPMk9rMy9uSTErVDdiUmo5QmU2RjZNUmdiSHRDUVFBajhmektvQS9GTTMxN0RMRFlvSDFhM0dCamdaZkRnRGJua0RvdjdLeTh0bmc0T0FkQUN4c0JJRTBGNE5qUFU1ajRITFdXTGVlYS9tQ2NpYmZsaWNRQU5iWDF6L3A2K3U3clFEUWU3dCtvQ282ZHp6alZwREtBV0RMRXdqOTUrZm4zeHdaR2ZrR3dLK0tBYXdCNHU0YUhyQWRBR3g1QWszL0x3RGdtU0lCWUtzai9SMnQ3SGFrVUdtZlc1VW5zTkQvZlFBSFNnSXNnQVRBMkZFSkFDNjhvaWNRQURZMk5qN3U3ZTE5RDhDaE1qZmk3Sm9hQU4wVEZJN0w1SnlBRzZSa01ubXhxMHNrRWlQRHc4UGNQZExic3dPd3o3UFNHenVxWVlEdUNYaGF4QTNTRFc2UTlLaFU5VThvK3YrdTlFK0RZNnorSy9rQVBUNDVKNUJEMDJBcWxYcTl1N3U3cDZ1cjY2bE1Kbk0zSEE2L29UTFA0aWZ0ajJiSDZGRU5BeGlBL0c3QWJUTDNCenc0NVNOM2pmd09GanBTbnBubnhrWTNQNWNDQUFaSkZ0QWVFd1F5Z1pQUCtSb3p6WXJQdHNmZ1pXTmpYTiszNndQMDk4c3Z4d3lhaDZlY0JJVUFzTkRwbXhzQ1luVHhrOENxbFlDOC8rTG5jOVVlMlNFNFdPam85aVJ3OGZoRzA5OU9FYlF5Z1VCd0VrRE9wdjNuQ2JzTTBJRW85bG5qTlY5UERUQ2V6clVzc0I0RzFISS80ejdqQW1CY1NoeGVrTXNBaHdFMzduWXVBNHhMaWNNTGNobmdNT0RHM2M1bGdIRXBjWGhCTGdNY0J0eTQyN2tNTUM0bERpL0laWUREZ0J0M081Y0J4cVhFNFFXNURIQVljT051NXpMQXVKUTR2S0FyejRCL0FaK1FXRjlpRXBpbEFBQUFBRWxGVGtTdVFtQ0MiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIvPjwvc3ZnPg==)
            4 4,
          auto !important;
        cursor: -webkit-image-set(
              url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABW9JREFUeF7tWs9PY1UYPa0yarWI7ZRAJezrj7AwJiQkBoYxbkxc+Ce4wQ2GiAQSDLCZUosGpxJk3JoYE3UjiQsV6KJEVkacRHQFJLQJUBXEDoxizan3Izcv/fVa83oL7yY3faU/3v3Od873nXuLB1d8eK54/HABKMEAAmMFJ6/eK4+XgjzWICVwL4AHFAj8G4Pm/EeblwIIHQBeM/AHOY+Pjyf9fv/42dlZKpfLpbxeb76tre0WgL8BnKtJQAScpmSEDgCDbwFwLZvNvh0IBN4qFtHh4eFcKBSKAvjLAoYA0VTMEAD4SMo/BMCXz+f3Gfz09DRmZmYwNTVVuNbH6enpOpkRDAaFFcIMkUlTAKEDcA3AIwD8R0dHn7e2tj4/MDCAtbW1i7gJhACjg7G/v/9uS0vLeSAQKAaG0RIRAEh/AvAogLZsNvtpIBB4ThhQTAqlwGg2iegAkP4E4InFxcWXhoaGEsw+WVBpNLNErAx4jAAAaE+n0x92dnY+Y5VBOTBqlAhrRsOGtQYUJAAglMlkPuro6Hi2WhZYI6ggEdYK6SIsnlI4HQdCb4NsgSyCjwMIxuPxF0dHR9/hijye+hxzKYlsb29HI5HIigKD3sJxNuiRsQ0+DIAyCFAGe3t7C+Fw+Gk7MrArkc3NzVd6enq+BXBfM1eOMcHqBC86AWUQjUZvjI+P36pVBpXAYJc5OTn5zu/3vwzgHoAzBUJDAOBNaYMpg1YA1wlCPp//mi/8XyyQyPr7+7G6ulp46vF4ngRwokBgTXDMRFnFTT/AdigyCKXT6UV2g3KeoNp0MWgO1gS53traWopEIrTWxwBySgoNA4CAsBj6VDG8HovFbo6Njc3WIgM9YAYuzwWwg4ODH9rb218DkAVwZAIAXBuLYcESsxuoYni72mLIIKUFWgPml+/u7v68tLT0hc/ny01OTqZU8L8pBrAOsD02jAEFSSoZFFwh60A6nb5DGVRiQbF2t7Oz88vCwsKXXq/3PBaL3VUUZ6DUPGnPzEv2T9UOs1pV1f2+Ug1eZFAohvF4/GY1nkAAWF5e/iqZTP40Nzf3owqYLU6fBIB6/1NNXjN4Zt9RL1AKAPEElIF4gg8qySCf/4+5ExMTsdnZ2e9VVWewDE4HgO2Ok3/nI1+T7bRj9Be6F6MRgbHtCQQAj8fzKoA/FM317DLDYoH1a3GBjgZfDgDbnkDov7Ky8tng4OAdACxsBIE0F4NjPU5j4HLWWLeea/mCcibflicQANbX1z/p6+u7rQDQe7t+oCo6dzzjVpDKAWDLEwj95+fn3xwZGfkGwK+KAawB4u4aHrAdAGx5Ak3/LwDgmSIBYKsj/R2t7HakUGmfW5UnsND/fQAHSgIsgATA2FEJAC68oicQADY2Nj7u7e19D8ChMjfi7JoaAN0TFI7L5JyAG6RkMnmxq0skEiPDw8PcPdLbswOwz7PSGzuqYYDuCXhaxA3SDW6Q9KhU9U8o+v+u9E+DY6z+K/kAPT45J5BD02AqlXq9u7u7p6ur66lMJnM3HA6/oTLP4iftj2bH6FENAxiA/G7AbTL3Bzw45SN3jfwOFjpSnpnnxkY3P5cCAAZJFtAeEwQygZPP+RozzYrPtsfgZWNjXN+36wP098svxwyah6ecBIUAsNDpmxsCYnTxk8CqlYC8/+Lnc9Ue2SE4WOjo9iRw8fhG099OEbQygUBwEkDOpv3nCbsM0IEo9lnjNV9PDTCezrUssB4G1HI/4z7jAmBcShxekMsAhwE37nYuA4xLicMLchngMODG3c5lgHEpcXhBLgMcBty427kMMC4lDi/IZYDDgBt3O5cBxqXE4QW5DHAYcONu5zLAuJQ4vKArz4B/AZ+QWF9iEpilAAAAAElFTkSuQmCC')
                2x,
              url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABW9JREFUeF7tWs9PY1UYPa0yarWI7ZRAJezrj7AwJiQkBoYxbkxc+Ce4wQ2GiAQSDLCZUosGpxJk3JoYE3UjiQsV6KJEVkacRHQFJLQJUBXEDoxizan3Izcv/fVa83oL7yY3faU/3v3Od873nXuLB1d8eK54/HABKMEAAmMFJ6/eK4+XgjzWICVwL4AHFAj8G4Pm/EeblwIIHQBeM/AHOY+Pjyf9fv/42dlZKpfLpbxeb76tre0WgL8BnKtJQAScpmSEDgCDbwFwLZvNvh0IBN4qFtHh4eFcKBSKAvjLAoYA0VTMEAD4SMo/BMCXz+f3Gfz09DRmZmYwNTVVuNbH6enpOpkRDAaFFcIMkUlTAKEDcA3AIwD8R0dHn7e2tj4/MDCAtbW1i7gJhACjg7G/v/9uS0vLeSAQKAaG0RIRAEh/AvAogLZsNvtpIBB4ThhQTAqlwGg2iegAkP4E4InFxcWXhoaGEsw+WVBpNLNErAx4jAAAaE+n0x92dnY+Y5VBOTBqlAhrRsOGtQYUJAAglMlkPuro6Hi2WhZYI6ggEdYK6SIsnlI4HQdCb4NsgSyCjwMIxuPxF0dHR9/hijye+hxzKYlsb29HI5HIigKD3sJxNuiRsQ0+DIAyCFAGe3t7C+Fw+Gk7MrArkc3NzVd6enq+BXBfM1eOMcHqBC86AWUQjUZvjI+P36pVBpXAYJc5OTn5zu/3vwzgHoAzBUJDAOBNaYMpg1YA1wlCPp//mi/8XyyQyPr7+7G6ulp46vF4ngRwokBgTXDMRFnFTT/AdigyCKXT6UV2g3KeoNp0MWgO1gS53traWopEIrTWxwBySgoNA4CAsBj6VDG8HovFbo6Njc3WIgM9YAYuzwWwg4ODH9rb218DkAVwZAIAXBuLYcESsxuoYni72mLIIKUFWgPml+/u7v68tLT0hc/ny01OTqZU8L8pBrAOsD02jAEFSSoZFFwh60A6nb5DGVRiQbF2t7Oz88vCwsKXXq/3PBaL3VUUZ6DUPGnPzEv2T9UOs1pV1f2+Ug1eZFAohvF4/GY1nkAAWF5e/iqZTP40Nzf3owqYLU6fBIB6/1NNXjN4Zt9RL1AKAPEElIF4gg8qySCf/4+5ExMTsdnZ2e9VVWewDE4HgO2Ok3/nI1+T7bRj9Be6F6MRgbHtCQQAj8fzKoA/FM317DLDYoH1a3GBjgZfDgDbnkDov7Ky8tng4OAdACxsBIE0F4NjPU5j4HLWWLeea/mCcibflicQANbX1z/p6+u7rQDQe7t+oCo6dzzjVpDKAWDLEwj95+fn3xwZGfkGwK+KAawB4u4aHrAdAGx5Ak3/LwDgmSIBYKsj/R2t7HakUGmfW5UnsND/fQAHSgIsgATA2FEJAC68oicQADY2Nj7u7e19D8ChMjfi7JoaAN0TFI7L5JyAG6RkMnmxq0skEiPDw8PcPdLbswOwz7PSGzuqYYDuCXhaxA3SDW6Q9KhU9U8o+v+u9E+DY6z+K/kAPT45J5BD02AqlXq9u7u7p6ur66lMJnM3HA6/oTLP4iftj2bH6FENAxiA/G7AbTL3Bzw45SN3jfwOFjpSnpnnxkY3P5cCAAZJFtAeEwQygZPP+RozzYrPtsfgZWNjXN+36wP098svxwyah6ecBIUAsNDpmxsCYnTxk8CqlYC8/+Lnc9Ue2SE4WOjo9iRw8fhG099OEbQygUBwEkDOpv3nCbsM0IEo9lnjNV9PDTCezrUssB4G1HI/4z7jAmBcShxekMsAhwE37nYuA4xLicMLchngMODG3c5lgHEpcXhBLgMcBty427kMMC4lDi/IZYDDgBt3O5cBxqXE4QW5DHAYcONu5zLAuJQ4vKArz4B/AZ+QWF9iEpilAAAAAElFTkSuQmCC')
                1x
            )
            4 4,
          auto !important;
      }
    </style>
    <script src="http://localhost:8097"></script>
  </head>
  <body>
    <div id="previewer"></div>
    <script>process = {env: {NODE_ENV: 'development'}}</script>
    <script async src="https://unpkg.com/es-module-shims@1.4.3/dist/es-module-shims.js"></script>
    <script type="importmap">{"imports": __IMPORT_MAP__}</script>
    <script type="module">__LOADER__</script>
  </body>
</html>
