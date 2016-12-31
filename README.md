# NgFractals

December 28th 2016.

I have take the project builded by @teropa and I tried to omptimize as much as possible 
the rendering performance of the ui.

See the demo at:

https://fractalng.tmpo.io/

## Other branches

[tree/master](Main branch)

[tree/async](Async) Points to a branch using async rendering (with requestIdleWork)


## First clarification:

On the blog post:
https://swizec.com/blog/animating-svg-nodes-react-preact-inferno-vue/swizec/7311

Swizec says that the app seems too laggy, sure, the problem is that it has been run  without production neither AOT optmitzations. Just take the @teropa version and: 

`
npm install &&
node_modules/.bin/ng serve --aot --prod
`

And you will be able to see how the version is smooth... (better than react one for sure)


## Steps from the initial

First thing I've had done. Reactify the @teropa version. Angular can work more 
or less the way cycle.js works.
I just suspected thant I will get better results with this, but there is not too much 
performance imrpovenent (perhaps a little but not too much). See that in @teropa version
the recursive component is rendering without change detector (ChangedetectorStrategy.OnPush)

Anyway, Reactifing it, had allow me to try ideas on the main code. 
But most of them had worked, but without too many improvement on performance: 

1. Debounce input. Tried to debounceTime the mousemove input. This is not a good idea, 
because you end up with a laggy version, not responding in real time to the mouse movements.

2. Instead of debouncing by time, debounce by position changed, something like:

```javascript
export function filter(x: MouseEvent, y: MouseEvent): boolean {
  const dx = Math.abs(x.offsetX - y.offsetX);
  const dy = Math.abs(x.offsetY - y.offsetY);
  return ((dx + dy) >= 10 ? false : true);
}

.fromEvent(element, 'mousemove')
  .distinctUntilChanged(filter)

```
This works, because really debounces the input. At this example, the tree is rendered 
only if there is a position change around 10px. You can try it an apply distinct values,
and just see the results. But, anyway, this doesn't affect too much the overall performance.  

The really bootleneck is not the data stream. Is the DOM and the operations we run on it.

3. After digging inside each rendered frame ( when I started at around 100-140ms ). 
What I found is that the most expensive calls are the creation and detruction of dom nodes.
Angular AOT has some magic DOM recycling and pooling. But seems that isn't enought to get a 
big performance gain. What I tried is to keep nodes in memory instead of destroying them, 
On the template the change is something like:

```
  <svg:g
  app-pythagoras
   [ngClass]="{'hide': rightArgs.w <= 2}"
   *ngIf="current && rightArgs.lvl < rightArgs.maxlvl"
  [s]="rightArgs" />
```

By using ngClass (hide/show) on the node we are keeping nodes on DOM and just update their properites. 
In general terms, performance is more predictable, you get a constant frame rate, 
but lower than before. You don't have really big long frames but, all frames are slower. .
(Keep in mind that we are mantaining a list of 2048 nodes and updating them on Real Time).

4. But we can do better: we can mix both approaches. 
Just keep in memory half of the list, and create the other half when needed. This 
is the final code published, and must say that I'm super happy with the real performance.
With this we improve the initial approach (because we are creating half of the elments),
but also optimizes the second (in memory) because we only have half of the elements.

5. Some other cheats. As known .. is more performance to render things with rounded values,
or fixed values than with all the decimal length. 

6. fillColor, is a function that also can be memoized. (not sure how it affects) because if 
you go to the timeline view you will find that the expensive parts on each frame are the
DOM creation and manipulation. 


## Conclusion

Learned a lot of things and had have a fun time with this experiment. 
I published the results and the final thoughts  just if someone is interested on looking at them.

The cycle.js and Vue VDom are fast. I think that both are based on the same project, but angular
is also fast!

Using RxJs also allow us to switch the scheduler (We can go from the ASAP, currently) to 
a requestAnimFrame, or sure is not diffucult to implement a new schedule that uses 
the requestIdleWork to build an async version.

I miss a canvas rendered version, just to see the diferent performance of svg vs canvas. 
I'm more or less sure, that with canvas, will get a better frame rate. 
(Perhaps on the next days I will do one, using pixi.js)

Angular templates are fun and clever and allows you to just make the DOM work as you want.

















